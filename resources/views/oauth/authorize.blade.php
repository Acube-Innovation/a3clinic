@extends('connector.layout')

@section('title', 'Connect Claude')

@section('content')
    <h1>Allow {{ $client->name }} to edit the website?</h1>
    <p>Signed in as <strong>{{ $user->email }}</strong>.</p>
    <p>If you allow this, Claude can, on your behalf:</p>
    <ul>
        <li>read and change the text of conditions, products, blog posts and site sections</li>
        <li>add photos and videos to drrijishealthcare.com</li>
        <li>undo changes it made</li>
    </ul>
    <p class="note">Changes go live immediately and are recorded. You can disconnect any time in Claude's connector settings.</p>

    <div class="row">
        <form method="post" action="{{ route('passport.authorizations.approve') }}">
            @csrf
            <input type="hidden" name="auth_token" value="{{ $authToken }}">
            <button type="submit" class="btn btn-primary">Allow</button>
        </form>
        <form method="post" action="{{ route('passport.authorizations.deny') }}">
            @csrf
            @method('DELETE')
            <input type="hidden" name="auth_token" value="{{ $authToken }}">
            <button type="submit" class="btn btn-ghost">Cancel</button>
        </form>
    </div>
@endsection
