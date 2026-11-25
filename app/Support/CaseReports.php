<?php

namespace App\Support;

use InvalidArgumentException;

/**
 * Rules shared by every way a case report is saved (admin form, connector)
 * and the public shape of a case.
 */
final class CaseReports
{
    public const SEXES = ['female' => 'Female', 'male' => 'Male', 'other' => 'Other / not stated'];

    public const VIEWS = ['Front', 'Crown', 'Parting', 'Hairline', 'Left side', 'Right side', 'Back', 'Close-up', 'Trichoscopy'];

    /** Keys that never leave the admin. */
    private const PRIVATE = ['consentDocument', 'consentDate', 'consentOnFile'];

    /**
     * A real case goes public only with written consent recorded. Sample
     * (placeholder) cases carry no patient data, and are hidden in production.
     */
    public static function publishProblem(array $case): ?string
    {
        if (empty($case['published']) || ! empty($case['sample'])) {
            return null;
        }
        if (empty($case['consentOnFile']) || empty($case['consentDate'])) {
            return 'A case can be published only with signed consent on file: tick "Consent on file" and enter the consent date.';
        }

        return null;
    }

    public static function assertPublishable(array $case): void
    {
        if ($problem = self::publishProblem($case)) {
            throw new InvalidArgumentException($problem);
        }
    }

    /** The case as the public site may see it. */
    public static function public(array $case): array
    {
        return array_diff_key($case, array_flip(self::PRIVATE));
    }

    /** First photo of the first stage and of the last stage that has one. */
    public static function coverPair(array $case): ?array
    {
        $withPhotos = array_values(array_filter($case['stages'] ?? [], fn ($s) => ! empty($s['photos'])));
        if (count($withPhotos) < 2) {
            return null;
        }
        $first = $withPhotos[0];
        $last = $withPhotos[count($withPhotos) - 1];

        return [
            'before' => $first['photos'][0]['image'],
            'beforeLabel' => $first['label'] ?: 'Before',
            'after' => $last['photos'][0]['image'],
            'afterLabel' => ($last['timepoint'] ?? '') ?: ($last['label'] ?: 'After'),
        ];
    }
}
