<x-filament-panels::page>
    <style>
        .consent-sheet { max-width: 52rem; margin: 0 auto; background: #fff; color: #143434; padding: 3rem; border-radius: 1rem; box-shadow: 0 1px 3px rgb(0 0 0 / .08); font-size: .95rem; line-height: 1.6; }
        .consent-sheet h2 { font-size: 1.35rem; font-weight: 700; color: #044b4d; margin: 0; }
        .consent-sheet h3 { font-size: 1rem; font-weight: 700; color: #044b4d; margin: 1.6rem 0 .5rem; }
        .consent-sheet ol, .consent-sheet ul { padding-left: 1.3rem; }
        .consent-sheet ol { list-style: decimal; } .consent-sheet ul { list-style: disc; }
        .consent-sheet li { margin: .3rem 0; }
        .consent-sheet .draft { display: inline-block; font-size: .7rem; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; background: #fef3c7; color: #92400e; padding: .2rem .6rem; border-radius: 999px; }
        .consent-sheet .box { display: inline-block; width: .95rem; height: .95rem; border: 1.5px solid #143434; border-radius: 3px; vertical-align: -2px; margin-right: .5rem; }
        .consent-sheet .line { border-bottom: 1px solid #143434; min-height: 2rem; }
        .consent-sheet .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1.2rem 2rem; margin-top: .8rem; }
        .consent-sheet .label { font-size: .75rem; color: #667676; margin-top: .25rem; }
        .consent-sheet .head { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; border-bottom: 2px solid #044b4d; padding-bottom: 1rem; margin-bottom: 1rem; }
        .consent-sheet .office { margin-top: 2rem; padding: 1rem 1.2rem; border: 1px dashed #8ababc; border-radius: .75rem; font-size: .85rem; }
        @media print {
            .fi-sidebar, .fi-topbar, .fi-header, .fi-page-header-main-ctn > .fi-header, .fi-sidebar-close-overlay { display: none !important; }
            .fi-main, .fi-page, .fi-main-ctn { padding: 0 !important; margin: 0 !important; max-width: none !important; }
            .consent-sheet { box-shadow: none; padding: 0; font-size: 10.5pt; }
            .consent-sheet .draft { display: none; }
            @page { margin: 16mm; }
        }
    </style>

    <div class="consent-sheet">
        <div class="head">
            <div>
                <h2>Consent to Use Clinical Photographs and an Anonymised Case Report</h2>
                <div class="label">For publication on the clinic website and in clinic educational material</div>
            </div>
            <div style="text-align:right">
                <strong>Dr. Riji's Health Care</strong><br>
                <span class="label">{{ $clinic['addressLine1'] ?? '' }}{{ !empty($clinic['addressLine2']) ? ', '.$clinic['addressLine2'] : '' }}<br>
                {{ $clinic['city'] ?? '' }}, {{ $clinic['state'] ?? '' }} {{ $clinic['postalCode'] ?? '' }} · {{ $clinic['phone'] ?? '' }}</span>
            </div>
        </div>

        <p><span class="draft">Draft — for legal review before use</span></p>

        <p>I, the undersigned, am a patient (or the parent / legal guardian of a patient) of Dr. Riji Rasheed (BHMS), Dr. Riji's Health Care. I have been asked whether photographs taken during my treatment, and an anonymised summary of my case, may be published. I understand that saying no will not affect my treatment in any way.</p>

        <h3>1. What may be published</h3>
        <p>Please tick each item you agree to:</p>
        <ul style="list-style:none;padding-left:0">
            <li><span class="box"></span>Photographs of the treated area (for example scalp, hairline, skin), taken at the clinic during my treatment.</li>
            <li><span class="box"></span>Photographs in which my face is visible. <em>(If not ticked, the clinic will crop or blur the face.)</em></li>
            <li><span class="box"></span>An anonymised written summary of my case: age range, sex, condition, duration, treatment approach and observed progress.</li>
        </ul>

        <h3>2. Where it may be published</h3>
        <ul style="list-style:none;padding-left:0">
            <li><span class="box"></span>The clinic website ({{ parse_url(config('app.url'), PHP_URL_HOST) ?: 'drrijishealthcare.com' }}), including its "Patient Results" pages.</li>
            <li><span class="box"></span>The clinic's social media accounts.</li>
            <li><span class="box"></span>Printed material displayed in the clinic.</li>
        </ul>

        <h3>3. How my privacy is protected</h3>
        <ol>
            <li>My name, initials, address, phone number, file number and exact date of birth will <strong>never</strong> be published. The case is identified only by a code (for example HF-2026-014).</li>
            <li>Location and camera data are removed from the photographs, and each photograph carries the clinic's watermark.</li>
            <li>Any detail of my history that could identify me (workplace, town, family details) will be left out.</li>
            <li>The signed copy of this form is kept privately by the clinic and is not published.</li>
        </ol>

        <h3>4. What I understand</h3>
        <ol>
            <li>The material is published to show how the clinic documents treatment. It is not a promise or guarantee of any result for me or for anyone else, and the clinic will say so wherever it is shown.</li>
            <li>Once published online, material may be copied or saved by others, and the clinic cannot fully control this.</li>
            <li>I may <strong>withdraw this consent at any time</strong> by telling the clinic in writing or by WhatsApp. The clinic will remove the material from its website and accounts within 7 days. Printed material already distributed cannot be recalled.</li>
            <li>I am not being paid, and I have not been offered any discount or benefit for giving consent.</li>
        </ol>

        <h3>5. Signatures</h3>
        <div class="grid2">
            <div><div class="line"></div><div class="label">Patient name (not published)</div></div>
            <div><div class="line"></div><div class="label">Patient signature</div></div>
            <div><div class="line"></div><div class="label">Parent / guardian name and relationship (if patient is under 18)</div></div>
            <div><div class="line"></div><div class="label">Parent / guardian signature</div></div>
            <div><div class="line"></div><div class="label">Date</div></div>
            <div><div class="line"></div><div class="label">Witness (clinic staff) name and signature</div></div>
        </div>

        <div class="office">
            <strong>For clinic use</strong>
            <div class="grid2">
                <div><div class="line"></div><div class="label">Case code assigned</div></div>
                <div><div class="line"></div><div class="label">Patient file number (internal only)</div></div>
                <div><div class="line"></div><div class="label">Uploaded to case report on (date)</div></div>
                <div><div class="line"></div><div class="label">Withdrawn on (date), if applicable</div></div>
            </div>
        </div>
    </div>
</x-filament-panels::page>
