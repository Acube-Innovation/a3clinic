<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Enquiry;
use App\Models\Section;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Public submissions from the booking wizard and contact form — a port of
 * src/lib/admin/submit.ts. Deliberately no auth (patients submit these);
 * this validation is the control, the client-side checks only a convenience.
 * Responses keep the old { ok, error } shape the React forms expect.
 */
class FormController extends Controller
{
    private const PHONE = '/^(\+?91)?[6-9]\d{9}$/';

    private const EMAIL = '/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/';

    private static function clean(mixed $value, int $max = 2000): string
    {
        return mb_substr(trim(is_scalar($value) ? (string) $value : ''), 0, $max);
    }

    private static function phone(mixed $value): string
    {
        return preg_replace('/[\s-]/', '', self::clean($value, 20));
    }

    /** ISO-8601 UTC with milliseconds, matching JavaScript's toISOString(). */
    private static function now(): string
    {
        return now('UTC')->format('Y-m-d\TH:i:s.v\Z');
    }

    private static function fail(string $error): JsonResponse
    {
        return response()->json(['ok' => false, 'error' => $error], 422);
    }

    public function booking(Request $request): JsonResponse
    {
        $name = self::clean($request->input('name'), 120);
        $phone = self::phone($request->input('phone'));
        $email = self::clean($request->input('email'), 200);
        $mode = $request->input('mode');
        $date = (string) $request->input('date');
        $time = (string) $request->input('time');

        if ($name === '' || ! preg_match(self::PHONE, $phone) || ! preg_match(self::EMAIL, $email)) {
            return self::fail('Please check your name, phone and email.');
        }
        if ($mode !== 'online' && $mode !== 'clinic') {
            return self::fail('Please choose a consultation mode.');
        }
        if (! preg_match('/^\d{4}-\d{2}-\d{2}$/', $date) || ! preg_match('/^\d{2}:\d{2}$/', $time)) {
            return self::fail('Please choose a valid date and time.');
        }

        $files = array_slice(array_filter((array) $request->input('files', []), 'is_scalar'), 0, 10);

        DB::transaction(function () use ($name, $phone, $email, $mode, $date, $time, $files, $request) {
            // Newest first: the old store prepended to the list.
            Appointment::query()->increment('position');
            $appointment = Appointment::create([
                'id' => 'A-'.Str::substr((string) Str::uuid(), 0, 8),
                'created_at' => self::now(),
                'status' => 'pending',
                'mode' => $mode,
                'concern' => self::clean($request->input('concern'), 60),
                'date' => $date,
                'time' => $time,
                'name' => $name,
                'phone' => $phone,
                'email' => $email,
                'age' => self::clean($request->input('age'), 3),
                'gender' => self::clean($request->input('gender'), 20),
                'notes' => self::clean($request->input('notes')),
                'position' => 0,
            ]);
            foreach (array_values($files) as $i => $file) {
                $appointment->files()->create(['position' => $i, 'filename' => self::clean($file, 200)]);
            }
            Section::markInitialized('appointments');
        });

        return response()->json(['ok' => true]);
    }

    public function enquiry(Request $request): JsonResponse
    {
        $name = self::clean($request->input('name'), 120);
        $phone = self::phone($request->input('phone'));
        $message = self::clean($request->input('message'));

        if ($name === '' || ! preg_match(self::PHONE, $phone) || $message === '') {
            return self::fail('Please check your name, phone and message.');
        }

        DB::transaction(function () use ($name, $phone, $message, $request) {
            Enquiry::query()->increment('position');
            Enquiry::create([
                'id' => 'E-'.Str::substr((string) Str::uuid(), 0, 8),
                'created_at' => self::now(),
                'read' => false,
                'name' => $name,
                'phone' => $phone,
                'email' => self::clean($request->input('email'), 200),
                'reason' => self::clean($request->input('reason'), 40),
                'message' => $message,
                'position' => 0,
            ]);
            Section::markInitialized('enquiries');
        });

        return response()->json(['ok' => true]);
    }
}
