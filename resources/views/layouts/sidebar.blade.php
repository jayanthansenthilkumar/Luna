@php
    $role = auth()->user()->role;
    $dashboardLink = route(auth()->user()->dashboard_route);
@endphp
<!-- ═══ SIDEBAR ═══ -->
<aside class="sidebar" id="sidebar">
    <div class="sidebar-header">
        <a href="{{ $dashboardLink }}" class="logo" style="text-decoration:none;">
            <span class="sparkle-icon"></span> Azhagii
        </a>
    </div>
    <nav class="sidebar-menu">

        <!-- All Roles: Dashboard -->
        <a href="{{ $dashboardLink }}" class="nav-item {{ request()->routeIs('dashboard.*') || request()->routeIs('dashboard') ? 'active' : '' }}">
            <i class="fas fa-tachometer-alt"></i> Dashboard
        </a>

        @if($role === 'superAdmin')
            <!-- superAdmin -->
            <a href="{{ route('colleges') }}" class="nav-item {{ request()->routeIs('colleges') ? 'active' : '' }}">
                <i class="fas fa-university"></i> Colleges
            </a>
            <a href="{{ route('azhagii-students') }}" class="nav-item {{ request()->routeIs('azhagii-students') ? 'active' : '' }}">
                <i class="fas fa-user-graduate"></i> Students
            </a>
        @endif

        @if(in_array($role, ['superAdmin', 'adminAzhagii']))
            <!-- superAdmin + adminAzhagii -->
            <a href="{{ route('users') }}" class="nav-item {{ request()->routeIs('users') ? 'active' : '' }}">
                <i class="fas fa-users"></i> Users
            </a>
            <a href="{{ route('profile-requests') }}" class="nav-item {{ request()->routeIs('profile-requests') ? 'active' : '' }}">
                <i class="fas fa-user-clock"></i> Profile Requests
            </a>
            <a href="{{ route('courses') }}" class="nav-item {{ request()->routeIs('courses') ? 'active' : '' }}">
                <i class="fas fa-book"></i> Courses
            </a>
            <a href="{{ route('course-approvals') }}" class="nav-item {{ request()->routeIs('course-approvals') ? 'active' : '' }}">
                <i class="fas fa-check-double"></i> Approvals
            </a>
            <a href="{{ route('subjects') }}" class="nav-item {{ request()->routeIs('subjects') ? 'active' : '' }}">
                <i class="fas fa-layer-group"></i> Subjects
            </a>
            <a href="{{ route('course-assignments') }}" class="nav-item {{ request()->routeIs('course-assignments') ? 'active' : '' }}">
                <i class="fas fa-link"></i> Assignments
            </a>
        @endif

        @if(in_array($role, ['azhagiiCoordinator', 'superAdmin']))
            <!-- Coordinator / SuperAdmin Features -->
            <a href="{{ route('my-courses') }}" class="nav-item {{ request()->routeIs('my-courses') ? 'active' : '' }}">
                <i class="fas fa-book-open"></i> My Courses
            </a>
            <a href="{{ route('create-course') }}" class="nav-item {{ request()->routeIs('create-course') ? 'active' : '' }}">
                <i class="fas fa-plus-circle"></i> Create Course
            </a>
            <a href="{{ route('content') }}" class="nav-item {{ request()->routeIs('content') ? 'active' : '' }}">
                <i class="fas fa-file-alt"></i> Content
            </a>
            <a href="{{ route('topics') }}" class="nav-item {{ request()->routeIs('topics') ? 'active' : '' }}">
                <i class="fas fa-tags"></i> Topics
            </a>
            @if($role === 'azhagiiCoordinator')
                <a href="{{ route('my-students') }}" class="nav-item {{ request()->routeIs('my-students') ? 'active' : '' }}">
                    <i class="fas fa-user-graduate"></i> Students
                </a>
            @endif
        @endif

        @if($role === 'azhagiiStudents')
            <!-- Student -->
            <a href="{{ route('browse-courses') }}" class="nav-item {{ request()->routeIs('browse-courses') ? 'active' : '' }}">
                <i class="fas fa-compass"></i> Browse Courses
            </a>
            <a href="{{ route('my-learning') }}" class="nav-item {{ request()->routeIs('my-learning') ? 'active' : '' }}">
                <i class="fas fa-graduation-cap"></i> My Learning
            </a>
        @endif

    </nav>
</aside>
