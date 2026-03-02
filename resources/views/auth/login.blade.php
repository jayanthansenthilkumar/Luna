@extends('layouts.guest')

@section('content')
<div class="auth-wrapper">
    <div class="auth-brand-side">
        <div class="auth-brand-bg"></div>
        <div class="auth-brand-content">
            <div class="logo" style="font-size:3.5rem;justify-content:center;margin-bottom:1rem;">
                <span class="sparkle-icon" style="width:40px;height:40px;"></span> Azhagii
            </div>
            <p>Multi-College Learning Management System</p>
        </div>
    </div>
    <div class="auth-form-side">
        <a href="{{ route('home') }}" class="back-to-home"><i class="fas fa-arrow-left"></i> Home</a>
        <div class="auth-card">
            <div class="auth-header">
                <h2>Welcome to Ziya</h2>
                <p>Sign in to continue to your dashboard</p>
            </div>

            <form id="loginFormLocal">
                <div class="form-group">
                    <label class="form-label">Username</label>
                    <input type="text" class="form-input" name="username" placeholder="Enter username" required>
                </div>

                <div class="form-group">
                    <label class="form-label">Password</label>
                    <input type="password" class="form-input" name="password" placeholder="Enter password" required>
                    <div style="text-align:right;margin-top:0.5rem;">
                        <a href="#" class="forgot-password">Forgot Password?</a>
                    </div>
                </div>

                <button type="submit" class="btn btn-primary" style="width:100%;margin-top:1rem;height:48px;font-size:1rem;">
                    Sign In
                </button>
            </form>

            <div class="auth-footer">
                Don't have an account? <a href="{{ route('register') }}">Create Account</a>
            </div>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<script>
$(document).ready(function() {
    $('#loginFormLocal').on('submit', function(e) {
        e.preventDefault();

        const btn = $(this).find('button[type="submit"]');
        const originalText = btn.html();
        const username = $(this).find('input[name="username"]').val().trim();
        const password = $(this).find('input[name="password"]').val();

        if(!username || !password) {
            Swal.fire({ icon: 'warning', title: 'Missing Input', text: 'Please enter both username and password.', confirmButtonColor: '#4285f4' });
            return;
        }

        btn.prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i> Signing In...');

        $.post('{{ route("login") }}', {
            _token: '{{ csrf_token() }}',
            username: username,
            password: password
        }, function(res) {
            if (res.status === 200) {
                const Toast = Swal.mixin({ toast: true, position: 'top-end', showConfirmButton: false, timer: 1500, timerProgressBar: true });
                Toast.fire({ icon: 'success', title: 'Signed in successfully' }).then(() => {
                    window.location.href = '{{ route("dashboard") }}';
                });
            } else {
                Swal.fire({ icon: 'error', title: 'Login Failed', text: res.message || 'Invalid credentials', confirmButtonColor: '#4285f4' });
                btn.prop('disabled', false).html(originalText);
            }
        }, 'json').fail(function(xhr) {
            var msg = 'Unable to connect to the server.';
            try { var res = JSON.parse(xhr.responseText); if(res.message) msg = res.message; } catch(e) {}
            Swal.fire({ icon: 'error', title: 'Login Failed', text: msg, confirmButtonColor: '#4285f4' });
            btn.prop('disabled', false).html(originalText);
        });
    });
});
</script>
@endpush
