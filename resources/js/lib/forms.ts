/**
 * Public form submissions (booking wizard, contact form). Same signatures and
 * result shape as the Next.js server actions in src/lib/admin/submit.ts; the
 * validation that matters runs in App\Http\Controllers\FormController.
 */

type Result = { ok: boolean; error?: string };

function xsrfToken(): string {
    const match = document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]+)/);

    return match ? decodeURIComponent(match[1]) : '';
}

async function post(url: string, body: unknown): Promise<Result> {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'X-XSRF-TOKEN': xsrfToken(),
        },
        body: JSON.stringify(body),
    });

    if (response.status === 429) {
        return { ok: false, error: 'Too many attempts — please wait a minute and try again.' };
    }

    return (await response.json()) as Result;
}

export function submitBooking(input: {
    mode: string;
    concern: string;
    date: string;
    time: string;
    name: string;
    phone: string;
    email: string;
    age: string;
    gender: string;
    notes: string;
    files: string[];
}): Promise<Result> {
    return post('/forms/booking', input);
}

export function submitEnquiry(input: { name: string; phone: string; email: string; reason: string; message: string }): Promise<Result> {
    return post('/forms/enquiry', input);
}
