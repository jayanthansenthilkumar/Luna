@extends('layouts.app')

@section('content')
<div class="stats-grid" id="approval-stats">
    <div class="dashboard-card">
        <div class="stat-icon" style="background:rgba(251,191,36,0.15);color:#fbbf24;width:50px;height:50px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1.3rem;"><i class="fas fa-clock"></i></div>
        <h3>{{ $stats['pending'] }}</h3><p>Pending Approval</p>
    </div>
    <div class="dashboard-card">
        <div class="stat-icon" style="background:rgba(66,133,244,0.15);color:#4285f4;width:50px;height:50px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1.3rem;"><i class="fas fa-book"></i></div>
        <h3>{{ $stats['courses'] }}</h3><p>Total Courses</p>
    </div>
    <div class="dashboard-card">
        <div class="stat-icon" style="background:rgba(248,113,113,0.15);color:#f87171;width:50px;height:50px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1.3rem;"><i class="fas fa-times-circle"></i></div>
        <h3>{{ $stats['rejected'] }}</h3><p>Rejected</p>
    </div>
    <div class="dashboard-card">
        <div class="stat-icon" style="background:rgba(52,211,153,0.15);color:#34d399;width:50px;height:50px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1.3rem;"><i class="fas fa-clipboard-list"></i></div>
        <h3>{{ $stats['enrollments'] }}</h3><p>Total Enrollments</p>
    </div>
</div>

<div class="approval-tabs" style="display:flex;gap:0.5rem;margin-bottom:1.5rem;">
    <button class="btn btn-primary" data-tab="pending" onclick="switchApprovalTab('pending')"><i class="fas fa-clock"></i> Pending Approval</button>
    <button class="btn btn-outline" data-tab="all" onclick="switchApprovalTab('all')"><i class="fas fa-list"></i> All Courses</button>
    <button class="btn btn-outline" data-tab="rejected" onclick="switchApprovalTab('rejected')"><i class="fas fa-times-circle"></i> Rejected</button>
</div>

{{-- Pending Tab --}}
<div id="approvalPendingTab">
    <div class="table-responsive">
        <table class="table" id="pendingCoursesTable">
            <thead><tr><th>#</th><th>Course</th><th>Code</th><th>Submitted By</th><th>College</th><th>Semester</th><th>Subjects</th><th>Syllabus</th><th>Date</th><th>Actions</th></tr></thead>
            <tbody>
                @foreach($pendingCourses as $i => $c)
                <tr>
                    <td>{{ $i + 1 }}</td>
                    <td>{{ $c->title }}</td>
                    <td>{{ $c->courseCode ?? '-' }}</td>
                    <td>{{ $c->creator->name ?? '-' }}</td>
                    <td>{{ $c->creator->college->name ?? '-' }}</td>
                    <td>{{ $c->semester ?? '-' }}</td>
                    <td>{{ $c->subjects_count }}</td>
                    <td>@if($c->syllabusUrl)<a href="{{ asset($c->syllabusUrl) }}" target="_blank"><i class="fas fa-file-pdf"></i></a>@else - @endif</td>
                    <td>{{ date('M d, Y', strtotime($c->createdAt)) }}</td>
                    <td>
                        <button class="btn btn-sm btn-outline" onclick="viewCourseDetail({{ $c->id }})"><i class="fas fa-eye"></i></button>
                        <button class="btn btn-sm btn-success" onclick="approveCourse({{ $c->id }})"><i class="fas fa-check"></i></button>
                        <button class="btn btn-sm btn-danger" onclick="rejectCourse({{ $c->id }})"><i class="fas fa-times"></i></button>
                    </td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
</div>

{{-- All Courses Tab --}}
<div id="approvalAllTab" style="display:none;">
    <div style="margin-bottom:1rem;">
        <select id="approvalStatusFilter" class="form-input form-input-sm" onchange="loadAllCoursesForApproval()" style="max-width:200px;">
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
        </select>
    </div>
    <div class="table-responsive">
        <table class="table" id="allCoursesApprovalTable">
            <thead><tr><th>#</th><th>Course</th><th>Code</th><th>Created By</th><th>Status</th><th>Semester</th><th>Syllabus</th><th>Date</th><th>Actions</th></tr></thead>
            <tbody></tbody>
        </table>
    </div>
</div>

{{-- Rejected Tab --}}
<div id="approvalRejectedTab" style="display:none;">
    <div class="table-responsive">
        <table class="table" id="rejectedCoursesTable">
            <thead><tr><th>#</th><th>Course</th><th>Code</th><th>Submitted By</th><th>Rejection Reason</th><th>Rejected By</th><th>Date</th></tr></thead>
            <tbody></tbody>
        </table>
    </div>
</div>
@endsection

@push('scripts')
<script>
function escapeHtml(t){if(!t)return '';return $('<div>').text(t).html();}

$(document).ready(function(){
    $('#pendingCoursesTable').DataTable({paging:true,searching:true,info:true,ordering:true,language:{search:'',searchPlaceholder:'Search...'}});
});

function switchApprovalTab(tab){
    document.querySelectorAll('.approval-tabs button').forEach(b=>{b.className=b.dataset.tab===tab?'btn btn-primary':'btn btn-outline';});
    document.getElementById('approvalPendingTab').style.display=tab==='pending'?'':'none';
    document.getElementById('approvalAllTab').style.display=tab==='all'?'':'none';
    document.getElementById('approvalRejectedTab').style.display=tab==='rejected'?'':'none';
    if(tab==='all') loadAllCoursesForApproval();
    if(tab==='rejected') loadRejectedCourses();
}

function loadAllCoursesForApproval(){
    var filter=$('#approvalStatusFilter').val();
    $.post('{{ route("api.courses") }}',{status_filter:filter},function(res){
        if(res.status===200){
            var html='';
            res.data.forEach(function(c,i){
                var badge='badge-'+(c.status==='active'?'active':c.status==='rejected'?'inactive':'draft');
                html+='<tr><td>'+(i+1)+'</td><td>'+escapeHtml(c.title)+'</td><td>'+(c.courseCode||'-')+'</td><td>'+escapeHtml(c.creator?c.creator.name:'-')+'</td><td><span class="badge '+badge+'">'+c.status+'</span></td><td>'+(c.semester||'-')+'</td><td>'+(c.syllabusUrl?'<a href="/'+c.syllabusUrl+'" target="_blank"><i class="fas fa-file-pdf"></i></a>':'-')+'</td><td>'+(c.createdAt?new Date(c.createdAt).toLocaleDateString():'')+'</td><td>';
                html+='<button class="btn btn-sm btn-outline" onclick="viewCourseDetail('+c.id+')"><i class="fas fa-eye"></i></button>';
                if(c.status==='pending'){html+=' <button class="btn btn-sm btn-success" onclick="approveCourse('+c.id+')"><i class="fas fa-check"></i></button> <button class="btn btn-sm btn-danger" onclick="rejectCourse('+c.id+')"><i class="fas fa-times"></i></button>';}
                html+='</td></tr>';
            });
            var tbl=$('#allCoursesApprovalTable');
            if($.fn.DataTable.isDataTable(tbl))tbl.DataTable().destroy();
            tbl.find('tbody').html(html);
            tbl.DataTable({paging:true,searching:true,info:true,ordering:true,language:{search:'',searchPlaceholder:'Search...'}});
        }
    },'json');
}

function loadRejectedCourses(){
    $.post('{{ route("api.courses") }}',{status_filter:'rejected'},function(res){
        if(res.status===200){
            var html='';
            res.data.forEach(function(c,i){
                html+='<tr><td>'+(i+1)+'</td><td>'+escapeHtml(c.title)+'</td><td>'+(c.courseCode||'-')+'</td><td>'+escapeHtml(c.creator?c.creator.name:'-')+'</td><td>'+escapeHtml(c.rejectionReason||'-')+'</td><td>'+escapeHtml(c.approver?c.approver.name:'-')+'</td><td>'+(c.createdAt?new Date(c.createdAt).toLocaleDateString():'')+'</td></tr>';
            });
            var tbl=$('#rejectedCoursesTable');
            if($.fn.DataTable.isDataTable(tbl))tbl.DataTable().destroy();
            tbl.find('tbody').html(html);
            tbl.DataTable({paging:true,searching:true,info:true,ordering:true,language:{search:'',searchPlaceholder:'Search...'}});
        }
    },'json');
}

function viewCourseDetail(id){
    $.post('{{ route("api.courses.detail") }}',{courseId:id},function(res){
        if(res.status===200){var c=res.data;
        Swal.fire({title:escapeHtml(c.title),html:'<div style="text-align:left;"><p><strong>Code:</strong> '+(c.courseCode||'N/A')+'</p><p><strong>Category:</strong> '+(c.category||'N/A')+'</p><p><strong>Semester:</strong> '+(c.semester||'N/A')+'</p><p><strong>Description:</strong> '+(c.description||'N/A')+'</p>'+(c.syllabusUrl?'<p><a href="/'+c.syllabusUrl+'" target="_blank">View Syllabus</a></p>':'')+'</div>',width:500});}
    },'json');
}

function approveCourse(id){
    Swal.fire({title:'Approve Course?',icon:'question',showCancelButton:true,confirmButtonColor:'#10b981',confirmButtonText:'Approve'}).then(r=>{
        if(r.isConfirmed){$.post('{{ route("api.courses.approve") }}',{id:id},function(res){if(res.status===200)Swal.fire('Approved!',res.message,'success').then(()=>location.reload());else Swal.fire('Error',res.message,'error');},'json');}
    });
}

function rejectCourse(id){
    Swal.fire({title:'Reject Course',input:'textarea',inputLabel:'Reason for rejection',inputValidator:v=>{if(!v)return 'Please provide a reason';},showCancelButton:true,confirmButtonColor:'#ef4444',confirmButtonText:'Reject'}).then(r=>{
        if(r.isConfirmed){$.post('{{ route("api.courses.reject") }}',{id:id,reason:r.value},function(res){if(res.status===200)Swal.fire('Rejected',res.message,'success').then(()=>location.reload());else Swal.fire('Error',res.message,'error');},'json');}
    });
}
</script>
@endpush
