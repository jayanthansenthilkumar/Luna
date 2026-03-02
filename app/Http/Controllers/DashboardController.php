<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\User;
use App\Models\College;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        return redirect()->route($user->dashboard_route);
    }

    public function superAdmin()
    {
        $stats = [
            'colleges' => College::count(),
            'users' => User::count(),
            'courses' => Course::count(),
            'pending_courses' => Course::where('status', 'pending')->count(),
            'enrollments' => Enrollment::count(),
        ];

        $recentUsers = User::with('college')
            ->orderBy('createdAt', 'desc')
            ->limit(5)
            ->get();

        // Upload folder stats
        $uploadFolders = ['profiles', 'content', 'thumbnails'];
        $folderStats = [];
        foreach ($uploadFolders as $folder) {
            $path = public_path('uploads/' . $folder);
            $files = 0;
            $size = 0;
            if (is_dir($path)) {
                $iterator = new \RecursiveIteratorIterator(
                    new \RecursiveDirectoryIterator($path, \RecursiveDirectoryIterator::SKIP_DOTS),
                    \RecursiveIteratorIterator::LEAVES_ONLY
                );
                foreach ($iterator as $file) {
                    if ($file->isFile()) {
                        $files++;
                        $size += $file->getSize();
                    }
                }
            }
            $folderStats[$folder] = [
                'folder' => $folder,
                'count' => $files,
                'size' => $size,
                'sizeFormatted' => $this->formatBytes($size),
            ];
        }

        $pageTitle = 'Super Admin Dashboard';
        return view('dashboards.superadmin', compact('stats', 'recentUsers', 'folderStats', 'pageTitle'));
    }

    public function admin()
    {
        $stats = [
            'users' => User::whereIn('role', ['azhagiiCoordinator', 'azhagiiStudents'])->count(),
            'courses' => Course::count(),
            'pending_courses' => Course::where('status', 'pending')->count(),
            'enrollments' => Enrollment::count(),
        ];

        $userBreakdown = [
            'azhagiiCoordinator' => User::where('role', 'azhagiiCoordinator')->count(),
            'azhagiiStudents' => User::where('role', 'azhagiiStudents')->count(),
        ];

        $recentCourses = Course::withCount('enrollments')
            ->orderBy('createdAt', 'desc')
            ->limit(5)
            ->get();

        $pageTitle = 'Admin Dashboard';
        return view('dashboards.admin', compact('stats', 'userBreakdown', 'recentCourses', 'pageTitle'));
    }

    public function coordinator()
    {
        $user = auth()->user();
        $cid = $user->collegeId;
        $uid = $user->id;

        $stats = [
            'courses' => DB::table('coursecolleges')->where('collegeId', $cid)->count(),
            'students' => User::where('collegeId', $cid)->where('role', 'azhagiiStudents')->count(),
            'my_courses' => Course::where('createdBy', $uid)->count(),
            'my_pending' => Course::where('createdBy', $uid)->where('status', 'pending')->count(),
            'my_approved' => Course::where('createdBy', $uid)->where('status', 'active')->count(),
            'my_rejected' => Course::where('createdBy', $uid)->where('status', 'rejected')->count(),
        ];

        $recentActivity = Enrollment::with(['student', 'course'])
            ->whereHas('student', fn($q) => $q->where('collegeId', $cid))
            ->orderBy('enrolledAt', 'desc')
            ->limit(8)
            ->get();

        $pageTitle = 'Coordinator Dashboard';
        return view('dashboards.coordinator', compact('stats', 'recentActivity', 'pageTitle'));
    }

    public function student()
    {
        $user = auth()->user();
        $sid = $user->id;
        $cid = $user->collegeId;

        $stats = [
            'enrolled' => Enrollment::where('studentId', $sid)->count(),
            'completed' => Enrollment::where('studentId', $sid)->where('status', 'completed')->count(),
            'available' => DB::table('coursecolleges')->where('collegeId', $cid)->count(),
            'avg_progress' => (int) round(Enrollment::where('studentId', $sid)->avg('progress') ?? 0),
        ];

        $profilePct = $user->profile_completion;

        $courseProgress = Enrollment::with('course')
            ->where('studentId', $sid)
            ->orderBy('enrolledAt', 'desc')
            ->get();

        $continueLearning = Enrollment::with('course')
            ->where('studentId', $sid)
            ->where('status', '!=', 'completed')
            ->where('progress', '>', 0)
            ->orderBy('enrolledAt', 'desc')
            ->limit(3)
            ->get();

        $pageTitle = 'Student Dashboard';
        return view('dashboards.student', compact('stats', 'profilePct', 'courseProgress', 'continueLearning', 'pageTitle'));
    }

    private function formatBytes($bytes, $precision = 2)
    {
        $units = ['B', 'KB', 'MB', 'GB'];
        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }
        return round($bytes, $precision) . ' ' . $units[$i];
    }
}
