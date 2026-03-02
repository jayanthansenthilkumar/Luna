<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>{{ $pageTitle ?? 'Dashboard' }} - Azhagii LMS</title>
    <link rel="stylesheet" href="{{ asset('assets/css/style.css') }}">
    <link href="https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
    <!-- DataTables CSS -->
    <link rel="stylesheet" href="https://cdn.datatables.net/1.13.8/css/jquery.dataTables.min.css">
    <link rel="stylesheet" href="https://cdn.datatables.net/buttons/2.4.2/css/buttons.dataTables.min.css">
    @stack('styles')
    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
</head>
<body>
    <script>
        const savedTheme = localStorage.getItem('Azhagii-theme') || 'dark';
        document.body.setAttribute('data-theme', savedTheme);
    </script>

    <div class="dashboard-layout">
        <div class="sidebar-overlay"></div>

        <!-- ═══ TOP BAR ═══ -->
        <header class="top-bar">
            <div class="top-bar-left">
                <button class="hamburger" id="menu-toggle"><i class="fas fa-bars"></i></button>
                <span class="page-title" id="pageTitle">{{ $pageTitle ?? 'Dashboard' }}</span>
            </div>
            <div class="top-bar-right">
                <button class="theme-toggle" id="themeToggle"><i class="fas fa-sun"></i></button>

                <!-- User Dropdown -->
                <div class="user-dropdown-wrapper">
                    <button class="user-dropdown-toggle" id="userDropdownToggle">
                        <div class="avatar-circle">
                            @if(!empty(auth()->user()->profilePhoto))
                                <img src="{{ asset(auth()->user()->profilePhoto) }}" alt="Avatar" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">
                            @else
                                {{ auth()->user()->avatar_initial }}
                            @endif
                        </div>
                        <span class="user-dropdown-name">{{ auth()->user()->name }}</span>
                        <i class="fas fa-chevron-down user-dropdown-arrow"></i>
                    </button>
                    <div class="user-dropdown-menu" id="userDropdownMenu">
                        <div class="user-dropdown-header">
                            <div class="avatar-circle" style="width:42px;height:42px;font-size:1.1rem;">
                                @if(!empty(auth()->user()->profilePhoto))
                                    <img src="{{ asset(auth()->user()->profilePhoto) }}" alt="Avatar" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">
                                @else
                                    {{ auth()->user()->avatar_initial }}
                                @endif
                            </div>
                            <div>
                                <div class="user-dropdown-fullname">{{ auth()->user()->name }}</div>
                                <div class="user-dropdown-email">{{ auth()->user()->email }}</div>
                            </div>
                        </div>
                        <div class="user-dropdown-divider"></div>
                        <a href="{{ route(auth()->user()->dashboard_route) }}" class="user-dropdown-item"><i class="fas fa-tachometer-alt"></i> Dashboard</a>
                        <a href="{{ route('profile') }}" class="user-dropdown-item"><i class="fas fa-user-circle"></i> My Profile</a>
                        <div class="user-dropdown-divider"></div>
                        <a href="{{ route('logout') }}" class="user-dropdown-item user-dropdown-item-danger"><i class="fas fa-sign-out-alt"></i> Logout</a>
                    </div>
                </div>
            </div>
        </header>

        <!-- Global Scroll Progress -->
        <div class="scroll-progress-container" id="globalScrollContainer">
            <div class="scroll-progress-bar" id="globalProgressBar"></div>
        </div>

        @include('layouts.sidebar')

        <!-- ═══ MAIN CONTENT WRAPPER ═══ -->
        <main class="main-content">
            <div class="content-wrapper">
                @yield('content')
            </div>
        </main>
    </div>

    <script>
        // Pass PHP vars to JS
        const USER_ROLE = @json(auth()->user()->role);
        const USER_ID = {{ auth()->id() }};
        const USER_NAME = @json(auth()->user()->name);
        const COLLEGE_ID = {{ auth()->user()->collegeId ?: 0 }};
        const COLLEGE_NAME = @json(auth()->user()->college->name ?? '');
        const CURRENT_PAGE = @json(Route::currentRouteName() ?? 'dashboard');
        const CSRF_TOKEN = '{{ csrf_token() }}';

        // Global Scroll Progress
        window.addEventListener('scroll', () => {
            const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
            const clientHeight = document.documentElement.clientHeight || document.body.clientHeight;
            if (scrollHeight > clientHeight) {
                const scrolled = (scrollTop / (scrollHeight - clientHeight)) * 100;
                const bar = document.getElementById('globalProgressBar');
                if (bar) bar.style.width = scrolled + '%';
            }
        });

        // Setup AJAX CSRF
        $.ajaxSetup({
            headers: { 'X-CSRF-TOKEN': CSRF_TOKEN }
        });

        // Global AJAX error handler
        $(document).ajaxError(function(event, xhr, settings, thrownError){
            if(xhr.statusHandled) return; // skip if handled locally
            var msg = 'An unexpected error occurred.';
            if(xhr.status === 419) msg = 'Session expired. Please refresh the page and try again.';
            else if(xhr.status === 401) msg = 'Unauthorized. Please log in again.';
            else if(xhr.status === 403) msg = 'You do not have permission to perform this action.';
            else if(xhr.status === 422){
                try{ var r=JSON.parse(xhr.responseText); if(r.message) msg=r.message; else if(r.errors){ msg=Object.values(r.errors).flat().join('<br>'); }}catch(e){}
            }
            else if(xhr.status === 409){
                try{ var r=JSON.parse(xhr.responseText); if(r.message) msg=r.message; }catch(e){}
            }
            else if(xhr.status >= 500) msg = 'Server error. Please try again later.';
            else if(xhr.status === 0) msg = 'Network error. Please check your connection.';
            else { try{ var r=JSON.parse(xhr.responseText); if(r.message) msg=r.message; }catch(e){} }
            Swal.fire('Error', msg, 'error');
        });
    </script>
    <!-- DataTables JS + Export Plugins -->
    <script src="https://cdn.datatables.net/1.13.8/js/jquery.dataTables.min.js"></script>
    <script src="https://cdn.datatables.net/buttons/2.4.2/js/dataTables.buttons.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/pdfmake.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/vfs_fonts.js"></script>
    <script src="https://cdn.datatables.net/buttons/2.4.2/js/buttons.html5.min.js"></script>
    <script src="https://cdn.datatables.net/buttons/2.4.2/js/buttons.print.min.js"></script>
    <script src="https://cdn.datatables.net/buttons/2.4.2/js/buttons.colVis.min.js"></script>
    <script src="{{ asset('assets/js/script.js') }}?v={{ time() }}"></script>
    @stack('scripts')
</body>
</html>
