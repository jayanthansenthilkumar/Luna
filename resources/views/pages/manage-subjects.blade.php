@extends('layouts.app')

@section('content')
<div class="section-toolbar">
    <select id="subjectCourseSelect" class="form-input form-input-sm" onchange="loadSubjects()" style="max-width:300px;">
        <option value="">-- Select Course --</option>
        @foreach($courses as $c)
            <option value="{{ $c->id }}">{{ $c->title }} ({{ $c->courseCode }})</option>
        @endforeach
    </select>
    <button class="btn btn-primary" onclick="showSubjectModal()"><i class="fas fa-plus"></i> Add Subject</button>
</div>

<div class="table-responsive">
    <table class="table" id="subjectsTable">
        <thead><tr><th>#</th><th>Title</th><th>Code</th><th>Description</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody><tr><td colspan="6" class="text-center">Select a course above</td></tr></tbody>
    </table>
</div>
@endsection

@push('scripts')
<script>
function escapeHtml(t){if(!t)return '';return $('<div>').text(t).html();}

function loadSubjects(){
    var courseId=$('#subjectCourseSelect').val();
    if(!courseId){$('#subjectsTable tbody').html('<tr><td colspan="6" class="text-center">Select a course above</td></tr>');return;}
    $.post('{{ route("api.subjects") }}',{courseId:courseId},function(res){
        if(res.status===200){
            var html='';
            if(!res.data.length) html='<tr><td colspan="6" class="text-center">No subjects found</td></tr>';
            else res.data.forEach(function(s,i){
                var sBadge = s.status === 'active' ? 'badge-active' : 'badge-inactive';
                html+='<tr><td>'+(i+1)+'</td><td>'+escapeHtml(s.title)+'</td><td>'+(s.code||'-')+'</td><td>'+escapeHtml(s.description||'-')+'</td><td><span class="badge '+sBadge+'">'+escapeHtml(s.status)+'</span></td><td><button class="btn btn-sm btn-outline" data-id="'+s.id+'" data-title="'+escapeHtml(s.title)+'" data-code="'+(s.code||'')+'" data-desc="'+escapeHtml(s.description||'')+'" data-status="'+s.status+'" onclick="editSubject(this)"><i class="fas fa-edit"></i></button> <button class="btn btn-sm btn-danger" onclick="deleteSubject('+s.id+')"><i class="fas fa-trash"></i></button></td></tr>';
            });
            $('#subjectsTable tbody').html(html);
        }
    },'json');
}

function showSubjectModal(){
    var courseId=$('#subjectCourseSelect').val();
    if(!courseId){Swal.fire('Select Course','Please select a course first','warning');return;}
    Swal.fire({title:'Add New Subject',html:
        '<div class="form-group"><label class="form-label">Title *</label><input id="sw-sTitle" class="swal2-input" placeholder="Subject title"></div>'+
        '<div class="form-group"><label class="form-label">Code</label><input id="sw-sCode" class="swal2-input" placeholder="Subject code"></div>'+
        '<div class="form-group"><label class="form-label">Description</label><textarea id="sw-sDesc" class="swal2-textarea" placeholder="Description"></textarea></div>',
        showCancelButton:true,confirmButtonText:'Add',
        preConfirm:()=>{var t=document.getElementById('sw-sTitle').value.trim();if(!t){Swal.showValidationMessage('Title required');return false;}return{courseId:courseId,title:t,code:document.getElementById('sw-sCode').value.trim(),description:document.getElementById('sw-sDesc').value.trim()};}
    }).then(r=>{if(r.isConfirmed){$.post('{{ route("api.subjects.store") }}',r.value,function(res){if(res.status===200){Swal.fire('Added',res.message,'success');loadSubjects();}else Swal.fire('Error',res.message,'error');},'json');}});
}

function deleteSubject(id){
    Swal.fire({title:'Delete Subject?',icon:'warning',showCancelButton:true,confirmButtonColor:'#d33',confirmButtonText:'Delete'}).then(r=>{
        if(r.isConfirmed){$.post('{{ route("api.subjects.delete") }}',{id:id},function(res){if(res.status===200){Swal.fire('Deleted',res.message,'success');loadSubjects();}else Swal.fire('Error',res.message,'error');},'json');}
    });
}

function editSubject(el){
    var id=$(el).data('id'),title=$(el).data('title'),code=$(el).data('code'),desc=$(el).data('desc'),status=$(el).data('status');
    Swal.fire({title:'Edit Subject',html:
        '<div class="form-group"><label class="form-label">Title</label><input id="sw-sTitle" class="swal2-input" value="'+escapeHtml(title)+'"></div>'+
        '<div class="form-group"><label class="form-label">Code</label><input id="sw-sCode" class="swal2-input" value="'+escapeHtml(code)+'"></div>'+
        '<div class="form-group"><label class="form-label">Description</label><textarea id="sw-sDesc" class="swal2-textarea">'+escapeHtml(desc)+'</textarea></div>'+
        '<div class="form-group"><label class="form-label">Status</label><select id="sw-sStatus" class="swal2-input"><option value="active"'+(status==='active'?' selected':'')+'>Active</option><option value="inactive"'+(status==='inactive'?' selected':'')+'>Inactive</option></select></div>',
        showCancelButton:true,confirmButtonText:'Update',
        preConfirm:()=>({id:id,title:document.getElementById('sw-sTitle').value.trim(),code:document.getElementById('sw-sCode').value.trim(),description:document.getElementById('sw-sDesc').value.trim(),status:document.getElementById('sw-sStatus').value})
    }).then(r=>{if(r.isConfirmed){$.post('{{ route("api.subjects.update") }}',r.value,function(res){if(res.status===200){Swal.fire('Updated',res.message,'success');loadSubjects();}else Swal.fire('Error',res.message,'error');},'json');}});
}
</script>
@endpush
