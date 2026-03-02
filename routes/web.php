<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\CollegeController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\CourseAssignmentController;
use App\Http\Controllers\SubjectController;
use App\Http\Controllers\TopicController;
use App\Http\Controllers\ContentController;
use App\Http\Controllers\EnrollmentController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DownloadController;

/*
|--------------------------------------------------------------------------
| Public / Guest Routes
|--------------------------------------------------------------------------
*/
Route::get('/', function () {
    return view('home');
})->name('home');

Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
Route::post('/login', [AuthController::class, 'login']);
Route::get('/register', [AuthController::class, 'showRegister'])->name('register');
Route::post('/register', [AuthController::class, 'register']);

// Public API - colleges list for registration
Route::post('/api/colleges/public', [CollegeController::class, 'listPublic'])->name('api.colleges.public');

/*
|--------------------------------------------------------------------------
| Authenticated Routes
|--------------------------------------------------------------------------
*/
Route::middleware(['auth'])->group(function () {

    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
    Route::get('/logout', [AuthController::class, 'logout']);
    Route::post('/api/check-session', [AuthController::class, 'checkSession'])->name('api.check-session');

    /*
    |----------------------------------------------------------------------
    | Dashboard (Smart Router)
    |----------------------------------------------------------------------
    */
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::get('/dashboard/superadmin', [DashboardController::class, 'superAdmin'])
        ->middleware('role:superAdmin')->name('dashboard.superadmin');
    Route::get('/dashboard/admin', [DashboardController::class, 'admin'])
        ->middleware('role:adminAzhagii')->name('dashboard.admin');
    Route::get('/dashboard/coordinator', [DashboardController::class, 'coordinator'])
        ->middleware('role:azhagiiCoordinator')->name('dashboard.coordinator');
    Route::get('/dashboard/student', [DashboardController::class, 'student'])
        ->middleware('role:azhagiiStudents')->name('dashboard.student');

    /*
    |----------------------------------------------------------------------
    | Profile (any authenticated user)
    |----------------------------------------------------------------------
    */
    Route::get('/profile', [ProfileController::class, 'index'])->name('profile');
    Route::post('/api/profile/me', [ProfileController::class, 'getMyProfile'])->name('api.profile.me');
    Route::post('/api/profile/update', [ProfileController::class, 'updateMyProfile'])->name('api.profile.update');
    Route::post('/api/profile/photo', [ProfileController::class, 'updatePhoto'])->name('api.profile.photo');
    Route::post('/api/profile/request-unlock', [ProfileController::class, 'requestUnlock'])->name('api.profile.request-unlock');

    /*
    |----------------------------------------------------------------------
    | Profile Completion Middleware
    |----------------------------------------------------------------------
    */
    Route::middleware(['profile.complete'])->group(function () {

        /*
        |------------------------------------------------------------------
        | Super Admin Only
        |------------------------------------------------------------------
        */
        Route::middleware(['role:superAdmin'])->group(function () {
            Route::get('/colleges', [CollegeController::class, 'index'])->name('colleges');
            Route::post('/api/colleges', [CollegeController::class, 'list'])->name('api.colleges');
            Route::post('/api/colleges/store', [CollegeController::class, 'store'])->name('api.colleges.store');
            Route::post('/api/colleges/update', [CollegeController::class, 'update'])->name('api.colleges.update');
            Route::post('/api/colleges/delete', [CollegeController::class, 'destroy'])->name('api.colleges.delete');

            Route::get('/azhagii-students', [UserController::class, 'azhagiiStudents'])->name('azhagii-students');

            Route::get('/download', [DownloadController::class, 'downloadFolder'])->name('download');
        });

        /*
        |------------------------------------------------------------------
        | Super Admin + Admin Azhagii
        |------------------------------------------------------------------
        */
        Route::middleware(['role:superAdmin,adminAzhagii'])->group(function () {
            Route::get('/users', [UserController::class, 'index'])->name('users');
            Route::post('/api/users', [UserController::class, 'list'])->name('api.users');
            Route::post('/api/users/detail', [UserController::class, 'detail'])->name('api.users.detail');
            Route::post('/api/users/store', [UserController::class, 'store'])->name('api.users.store');
            Route::post('/api/users/update', [UserController::class, 'update'])->name('api.users.update');
            Route::post('/api/users/delete', [UserController::class, 'destroy'])->name('api.users.delete');

            Route::get('/profile-requests', [ProfileController::class, 'requestsPage'])->name('profile-requests');
            Route::post('/api/profile/requests', [ProfileController::class, 'listRequests'])->name('api.profile.requests');
            Route::post('/api/profile/resolve', [ProfileController::class, 'resolveRequest'])->name('api.profile.resolve');

            Route::get('/courses', [CourseController::class, 'index'])->name('courses');
            Route::post('/api/courses', [CourseController::class, 'list'])->name('api.courses');
            Route::post('/api/courses/detail', [CourseController::class, 'detail'])->name('api.courses.detail');
            Route::post('/api/courses/store', [CourseController::class, 'store'])->name('api.courses.store');
            Route::post('/api/courses/update', [CourseController::class, 'update'])->name('api.courses.update');
            Route::post('/api/courses/delete', [CourseController::class, 'destroy'])->name('api.courses.delete');

            Route::get('/course-approvals', [CourseController::class, 'approvalsPage'])->name('course-approvals');
            Route::post('/api/courses/approve', [CourseController::class, 'approve'])->name('api.courses.approve');
            Route::post('/api/courses/reject', [CourseController::class, 'reject'])->name('api.courses.reject');

            Route::get('/course-assignments', [CourseAssignmentController::class, 'index'])->name('course-assignments');
            Route::post('/api/assignments', [CourseAssignmentController::class, 'list'])->name('api.assignments');
            Route::post('/api/assignments/store', [CourseAssignmentController::class, 'store'])->name('api.assignments.store');
            Route::post('/api/assignments/delete', [CourseAssignmentController::class, 'destroy'])->name('api.assignments.delete');

            Route::get('/subjects', [SubjectController::class, 'index'])->name('subjects');
            Route::post('/api/subjects', [SubjectController::class, 'list'])->name('api.subjects');
            Route::post('/api/subjects/store', [SubjectController::class, 'store'])->name('api.subjects.store');
            Route::post('/api/subjects/update', [SubjectController::class, 'update'])->name('api.subjects.update');
            Route::post('/api/subjects/delete', [SubjectController::class, 'destroy'])->name('api.subjects.delete');
        });

        /*
        |------------------------------------------------------------------
        | Coordinator + Super Admin
        |------------------------------------------------------------------
        */
        Route::middleware(['role:azhagiiCoordinator,superAdmin'])->group(function () {
            Route::get('/my-courses', [CourseController::class, 'myCourses'])->name('my-courses');
            Route::get('/create-course', [CourseController::class, 'createPage'])->name('create-course');

            Route::get('/content', [ContentController::class, 'index'])->name('content');
            Route::post('/api/content', [ContentController::class, 'list'])->name('api.content');
            Route::post('/api/content/store', [ContentController::class, 'store'])->name('api.content.store');
            Route::post('/api/content/update', [ContentController::class, 'update'])->name('api.content.update');
            Route::post('/api/content/delete', [ContentController::class, 'destroy'])->name('api.content.delete');

            Route::get('/topics', [TopicController::class, 'index'])->name('topics');
            Route::post('/api/topics', [TopicController::class, 'list'])->name('api.topics');
            Route::post('/api/topics/store', [TopicController::class, 'store'])->name('api.topics.store');
            Route::post('/api/topics/update', [TopicController::class, 'update'])->name('api.topics.update');
            Route::post('/api/topics/delete', [TopicController::class, 'destroy'])->name('api.topics.delete');
        });

        /*
        |------------------------------------------------------------------
        | Coordinator Only
        |------------------------------------------------------------------
        */
        Route::middleware(['role:azhagiiCoordinator'])->group(function () {
            Route::get('/my-students', [EnrollmentController::class, 'myStudents'])->name('my-students');
            Route::post('/api/course-students', [EnrollmentController::class, 'courseStudents'])->name('api.course-students');
        });

        /*
        |------------------------------------------------------------------
        | Student Only
        |------------------------------------------------------------------
        */
        Route::middleware(['role:azhagiiStudents'])->group(function () {
            Route::get('/browse-courses', [CourseController::class, 'browse'])->name('browse-courses');
            Route::get('/my-learning', [EnrollmentController::class, 'myLearning'])->name('my-learning');
            Route::get('/course-viewer', [EnrollmentController::class, 'courseViewer'])->name('course-viewer');

            Route::post('/api/enroll', [EnrollmentController::class, 'enroll'])->name('api.enroll');
            Route::post('/api/unenroll', [EnrollmentController::class, 'unenroll'])->name('api.unenroll');
            Route::post('/api/enrollments', [EnrollmentController::class, 'list'])->name('api.enrollments');
            Route::post('/api/enrollments/progress', [EnrollmentController::class, 'updateProgress'])->name('api.enrollments.progress');
            Route::post('/api/topics/complete', [TopicController::class, 'markComplete'])->name('api.topics.complete');
        });
    });
});
