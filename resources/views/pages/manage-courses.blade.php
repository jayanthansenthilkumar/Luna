@extends('layouts.app')

@section('content')
<div class="section-toolbar">
    <div></div>
    <div>
        <button class="btn btn-primary" onclick="showCourseModal()"><i class="fas fa-plus"></i> Add Course</button>
    </div>
</div>

<div class="table-responsive">
    <table class="table" id="coursesTable">
        <thead><tr><th>#</th><th>Title</th><th>Category</th><th>Semester</th><th>Colleges</th><th>Enrollments</th><th>Content</th><th>Status</th><th>Syllabus</th><th>Actions</th></tr></thead>
        <tbody>
            @foreach($courses as $i => $c)
                <tr>
                    <td>{{ $i + 1 }}</td>
                    <td>{{ $c->title }}</td>
                    <td>{{ $c->category ?? 'N/A' }}</td>
                    <td>{{ $c->semester ?? '-' }}</td>
                    <td>{{ $c->college_assignments_count }}</td>
                    <td>{{ $c->enrollments_count }}</td>
                    <td>{{ $c->contents_count }}</td>
                    <td><span class="badge badge-{{ $c->status === 'active' ? 'active' : ($c->status === 'draft' ? 'draft' : 'inactive') }}">{{ $c->status }}</span></td>
                    <td>@if($c->syllabusUrl)<a href="{{ asset($c->syllabusUrl) }}" target="_blank"><i class="fas fa-file-pdf"></i></a>@else - @endif</td>
                    <td>
                        <button class="btn btn-sm btn-outline" onclick="editCourse({{ $c->id }})"><i class="fas fa-edit"></i></button>
                        <button class="btn btn-sm btn-danger" onclick="deleteCourse({{ $c->id }})"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>
            @endforeach
        </tbody>
    </table>
</div>
@endsection

@push('scripts')
<script>
function escapeHtml(str){if(!str)return '';return $('<div>').text(str).html();}
$(document).ready(function(){$('#coursesTable').DataTable();});

function showCourseModal(){
    Swal.fire({title:'Add Course',html:
    '<div class="form-group"><label class="form-label">Title</label><input id="sCTitle" class="swal2-input" placeholder="Course title"></div>'+
    '<div class="form-group"><label class="form-label">Course Code</label><input id="sCCode" class="swal2-input" placeholder="e.g. CS101"></div>'+
    '<div class="form-group"><label class="form-label">Description</label><textarea id="sCDesc" class="swal2-textarea" placeholder="Description"></textarea></div>'+
    '<div class="form-group"><label class="form-label">Category</label><input id="sCCat" class="swal2-input" placeholder="Category"></div>'+
    '<div class="form-group"><label class="form-label">Semester</label><select id="sCSem" class="swal2-input"><option value="">Select</option><option>1</option><option>2</option><option>3</option><option>4</option><option>5</option><option>6</option><option>7</option><option>8</option></select></div>'+
    '<div class="form-group"><label class="form-label">Status</label><select id="sCStatus" class="swal2-input"><option value="draft">Draft</option><option value="active">Active</option></select></div>',
    showCancelButton:true,confirmButtonText:'Add',
    preConfirm:()=>{const title=document.getElementById('sCTitle').value.trim();if(!title){Swal.showValidationMessage('Title required');return false;}return{title,courseCode:document.getElementById('sCCode').value.trim(),description:document.getElementById('sCDesc').value.trim(),category:document.getElementById('sCCat').value.trim(),semester:document.getElementById('sCSem').value,status:document.getElementById('sCStatus').value};}
    }).then(r=>{if(r.isConfirmed){$.post('{{ route("api.courses.store") }}',r.value,function(res){if(res.status===200){Swal.fire('Success',res.message,'success').then(()=>location.reload());}else Swal.fire('Error',res.message,'error');},'json');}});
}

function editCourse(id){
    $.post('{{ route("api.courses.detail") }}',{courseId:id},function(res){
        if(res.status===200){const c=res.data;
        Swal.fire({title:'Edit Course',html:
        '<div class="form-group"><label class="form-label">Title</label><input id="sCTitle" class="swal2-input" value="'+escapeHtml(c.title)+'"></div>'+
        '<div class="form-group"><label class="form-label">Code</label><input id="sCCode" class="swal2-input" value="'+escapeHtml(c.courseCode||'')+'"></div>'+
        '<div class="form-group"><label class="form-label">Description</label><textarea id="sCDesc" class="swal2-textarea">'+escapeHtml(c.description||'')+'</textarea></div>'+
        '<div class="form-group"><label class="form-label">Category</label><input id="sCCat" class="swal2-input" value="'+escapeHtml(c.category||'')+'"></div>'+
        '<div class="form-group"><label class="form-label">Semester</label><select id="sCSem" class="swal2-input"><option value="">-</option>'+'12345678'.split('').map(s=>'<option'+(c.semester==s?' selected':'')+'>'+s+'</option>').join('')+'</select></div>'+
        '<div class="form-group"><label class="form-label">Status</label><select id="sCStatus" class="swal2-input"><option value="draft"'+(c.status==='draft'?' selected':'')+'>Draft</option><option value="active"'+(c.status==='active'?' selected':'')+'>Active</option><option value="inactive"'+(c.status==='inactive'?' selected':'')+'>Inactive</option></select></div>',
        showCancelButton:true,confirmButtonText:'Update',
        preConfirm:()=>({id,title:document.getElementById('sCTitle').value.trim(),courseCode:document.getElementById('sCCode').value.trim(),description:document.getElementById('sCDesc').value.trim(),category:document.getElementById('sCCat').value.trim(),semester:document.getElementById('sCSem').value,status:document.getElementById('sCStatus').value})
        }).then(r=>{if(r.isConfirmed){$.post('{{ route("api.courses.update") }}',r.value,function(res){if(res.status===200){Swal.fire('Updated',res.message,'success').then(()=>location.reload());}else Swal.fire('Error',res.message,'error');},'json');}});}
    },'json');
}

function deleteCourse(id){
    Swal.fire({title:'Delete Course?',text:'This cannot be undone.',icon:'warning',showCancelButton:true,confirmButtonColor:'#d33',confirmButtonText:'Delete'}).then(r=>{if(r.isConfirmed){$.post('{{ route("api.courses.delete") }}',{id},function(res){if(res.status===200){Swal.fire('Deleted',res.message,'success').then(()=>location.reload());}else Swal.fire('Error',res.message,'error');},'json');}});
}
</script>
@endpush
