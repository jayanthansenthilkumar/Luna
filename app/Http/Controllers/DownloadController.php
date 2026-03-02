<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;

class DownloadController extends Controller
{
    public function downloadFolder(Request $request)
    {
        $user = auth()->user();
        if ($user->role !== 'superAdmin') {
            abort(403, 'Access denied. SuperAdmin only.');
        }

        $allowedFolders = ['profiles', 'content', 'thumbnails'];
        $folder = $request->query('folder');

        if (!in_array($folder, $allowedFolders, true)) {
            abort(400, 'Invalid folder. Allowed: ' . implode(', ', $allowedFolders));
        }

        $dirPath = public_path('uploads/' . $folder);

        if (!is_dir($dirPath)) {
            abort(404, 'Folder not found.');
        }

        $files = [];
        $iterator = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator($dirPath, \RecursiveDirectoryIterator::SKIP_DOTS),
            \RecursiveIteratorIterator::LEAVES_ONLY
        );
        foreach ($iterator as $file) {
            if ($file->isFile()) {
                $files[] = $file->getRealPath();
            }
        }

        if (empty($files)) {
            abort(404, 'No files found in the ' . $folder . ' folder.');
        }

        $zipFileName = $folder . '_' . date('Y-m-d_His') . '.zip';
        $tmpZipPath = sys_get_temp_dir() . DIRECTORY_SEPARATOR . $zipFileName;

        $zip = new \ZipArchive();
        if ($zip->open($tmpZipPath, \ZipArchive::CREATE | \ZipArchive::OVERWRITE) !== true) {
            abort(500, 'Failed to create ZIP file.');
        }

        foreach ($files as $fp) {
            $relativePath = str_replace('\\', '/', substr($fp, strlen($dirPath) + 1));
            $zip->addFile($fp, $relativePath);
        }
        $zip->close();

        return response()->download($tmpZipPath, $zipFileName)->deleteFileAfterSend(true);
    }
}
