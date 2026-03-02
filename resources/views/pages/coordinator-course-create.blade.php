@extends('layouts.app')

@section('content')
<div class="card" style="max-width:800px;">
    <h2 style="margin-bottom:0.25rem;">Submit a New Course</h2>
    <p style="opacity:0.6;margin-bottom:1.5rem;">Fill in the course details below. It will be submitted for approval.</p>

    <form id="coordCourseForm" enctype="multipart/form-data">
        <div class="responsive-grid-2">
            <div class="form-group">
                <label class="form-label">Course Title *</label>
                <input type="text" name="title" class="form-input" required placeholder="Enter course title">
            </div>
            <div class="form-group">
                <label class="form-label">Course Code</label>
                <input type="text" name="courseCode" class="form-input" placeholder="e.g. CS101">
            </div>
        </div>
        <div class="form-group">
            <label class="form-label">Description</label>
            <textarea name="description" class="form-input" rows="3" placeholder="Brief course description"></textarea>
        </div>
        <div class="responsive-grid-3">
            <div class="form-group">
                <label class="form-label">Category</label>
                <input type="text" name="category" class="form-input" placeholder="e.g. Computer Science">
            </div>
            <div class="form-group">
                <label class="form-label">Course Type</label>
                <select name="courseType" class="form-input">
                    <option value="theory">Theory</option>
                    <option value="lab">Lab</option>
                    <option value="elective">Elective</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">Semester</label>
                <select name="semester" class="form-input">
                    <option value="">Select</option>
                    @for($i = 1; $i <= 8; $i++)
                        <option value="{{ $i }}">{{ $i }}</option>
                    @endfor
                </select>
            </div>
        </div>
        <div class="responsive-grid-2">
            <div class="form-group">
                <label class="form-label">Regulation</label>
                <input type="text" name="regulation" class="form-input" placeholder="e.g. R2021">
            </div>
            <div class="form-group">
                <label class="form-label">Academic Year</label>
                <input type="text" name="academicYear" class="form-input" placeholder="e.g. 2024-2025">
            </div>
        </div>
        <div class="form-group">
            <label class="form-label">Syllabus PDF</label>
            <input type="file" name="syllabus" class="form-input" accept=".pdf">
        </div>

        <div style="margin-top:1.5rem;">
            <h3 style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.5rem;"><i class="fas fa-layer-group" style="color:#4285f4;"></i> Units / Subjects</h3>
            <p style="opacity:0.6;font-size:0.9rem;margin-bottom:1rem;">Add up to 5 units for this course.</p>
            <div id="unitsContainer">
                @for($i = 1; $i <= 5; $i++)
                <div class="unit-entry" style="display:flex;align-items:center;gap:0.75rem;margin-bottom:0.75rem;">
                    <span style="font-weight:600;min-width:70px;">Unit {{ $i }}</span>
                    <input type="text" name="unit_{{ $i }}" class="form-input" placeholder="Unit {{ $i }} title">
                </div>
                @endfor
            </div>
        </div>

        <div class="responsive-btn-row" style="margin-top:1.5rem;">
            <button type="submit" class="btn btn-primary"><i class="fas fa-paper-plane"></i> Submit for Approval</button>
            <a href="{{ route('my-courses') }}" class="btn btn-outline"><i class="fas fa-arrow-left"></i> Cancel</a>
        </div>
    </form>
</div>

<div style="margin-top:2rem;">
    <h2 class="dashboard-section-title"><i class="fas fa-history" style="color:#4285f4;"></i> My Submitted Courses</h2>
    <div class="table-responsive">
        <table class="table" id="mySubmittedCoursesTable">
            <thead><tr><th>#</th><th>Title</th><th>Code</th><th>Semester</th><th>Status</th><th>Reason</th><th>Date</th><th>Actions</th></tr></thead>
            <tbody>
                @foreach($myCourses as $i => $c)
                <tr>
                    <td>{{ $i + 1 }}</td>
                    <td>{{ $c->title }}</td>
                    <td>{{ $c->courseCode ?? '-' }}</td>
                    <td>{{ $c->semester ?? '-' }}</td>
                    <td><span class="badge badge-{{ $c->status === 'active' ? 'active' : ($c->status === 'rejected' ? 'inactive' : 'draft') }}">{{ $c->status }}</span></td>
                    <td>{{ $c->rejectionReason ?? '-' }}</td>
                    <td>{{ date('M d, Y', strtotime($c->createdAt)) }}</td>
                    <td>
                        @if(in_array($c->status, ['pending', 'rejected']))
                            <button class="btn btn-sm btn-outline" onclick="editMySubmittedCourse({{ $c->id }})"><i class="fas fa-edit"></i></button>
                            <button class="btn btn-sm btn-danger" onclick="deleteMySubmittedCourse({{ $c->id }})"><i class="fas fa-trash"></i></button>
                        @else
                            <button class="btn btn-sm btn-outline" onclick="viewCourseDetail({{ $c->id }})"><i class="fas fa-eye"></i></button>
                        @endif
                    </td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
</div>
@endsection

@push('scripts')
<script>
function escapeHtml(t){if(!t)return '';return $('<div>').text(t).html();}
$(document).ready(function(){$('#mySubmittedCoursesTable').DataTable({paging:true,searching:true,info:true,ordering:true,language:{search:'',searchPlaceholder:'Search...'}});});

$('#coordCourseForm').on('submit',function(e){
    e.preventDefault();
    var fd=new FormData(this);
    $.ajax({url:'{{ route("api.courses.store") }}',type:'POST',data:fd,processData:false,contentType:false,headers:{'X-CSRF-TOKEN':CSRF_TOKEN},success:function(res){
        if(res.status===200){Swal.fire('Submitted',res.message,'success').then(()=>location.reload());}else Swal.fire('Error',res.message,'error');
    },dataType:'json'});
});

function editMySubmittedCourse(id){
    $.post('{{ route("api.courses.detail") }}',{courseId:id},function(res){
        if(res.status===200){var c=res.data;
        Swal.fire({title:'Edit Course',html:
            '<input type="hidden" id="sw-eId" value="'+c.id+'">'+
            '<div class="form-group"><label class="form-label">Title</label><input id="sw-eTitle" class="swal2-input" value="'+escapeHtml(c.title)+'"></div>'+
            '<div class="form-group"><label class="form-label">Code</label><input id="sw-eCode" class="swal2-input" value="'+escapeHtml(c.courseCode||'')+'"></div>'+
            '<div class="form-group"><label class="form-label">Type</label><select id="sw-eType" class="swal2-input"><option value="theory"'+(c.courseType==='theory'?' selected':'')+'>Theory</option><option value="lab"'+(c.courseType==='lab'?' selected':'')+'>Lab</option><option value="elective"'+(c.courseType==='elective'?' selected':'')+'>Elective</option></select></div>'+
            '<div class="form-group"><label class="form-label">Semester</label><select id="sw-eSem" class="swal2-input"><option value="">-</option>'+'12345678'.split('').map(s=>'<option'+(c.semester==s?' selected':'')+'>'+s+'</option>').join('')+'</select></div>'+
            '<div class="form-group"><label class="form-label">Description</label><textarea id="sw-eDesc" class="swal2-textarea">'+escapeHtml(c.description||'')+'</textarea></div>'+
            '<p style="font-size:0.85rem;opacity:0.7;margin-top:0.5rem;">Note: Editing will re-submit the course for approval.</p>',
            showCancelButton:true,confirmButtonText:'Update',
            preConfirm:()=>({id:c.id,title:document.getElementById('sw-eTitle').value.trim(),courseCode:document.getElementById('sw-eCode').value.trim(),courseType:document.getElementById('sw-eType').value,semester:document.getElementById('sw-eSem').value,description:document.getElementById('sw-eDesc').value.trim()})
        }).then(r=>{if(r.isConfirmed){$.post('{{ route("api.courses.update") }}',r.value,function(res2){if(res2.status===200)Swal.fire('Updated',res2.message,'success').then(()=>location.reload());else Swal.fire('Error',res2.message,'error');},'json');}});}
    },'json');
}

function deleteMySubmittedCourse(id){
    Swal.fire({title:'Delete Course?',icon:'warning',showCancelButton:true,confirmButtonColor:'#d33',confirmButtonText:'Delete'}).then(r=>{
        if(r.isConfirmed){$.post('{{ route("api.courses.delete") }}',{id:id},function(res){if(res.status===200)Swal.fire('Deleted',res.message,'success').then(()=>location.reload());else Swal.fire('Error',res.message,'error');},'json');}
    });
}

function viewCourseDetail(id){
    $.post('{{ route("api.courses.detail") }}',{courseId:id},function(res){
        if(res.status===200){var c=res.data;
        Swal.fire({title:escapeHtml(c.title),html:'<div style="text-align:left;"><p><strong>Code:</strong> '+(c.courseCode||'N/A')+'</p><p><strong>Type:</strong> '+(c.courseType||'N/A')+'</p><p><strong>Status:</strong> <span class="badge badge-'+(c.status==='active'?'active':'draft')+'">'+c.status+'</span></p><p><strong>Description:</strong> '+(c.description||'N/A')+'</p></div>',width:500});}
    },'json');
}
</script>
@endpush
