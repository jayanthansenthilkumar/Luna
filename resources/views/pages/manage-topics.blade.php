@extends('layouts.app')

@section('content')
<div class="section-toolbar">
    <select id="topicCourseSelect" class="form-input form-input-sm" onchange="loadTopicSubjects()" style="max-width:250px;">
        <option value="">-- Select Course --</option>
        @foreach($courses as $c)
            <option value="{{ $c->id }}">{{ $c->title }} ({{ $c->courseCode }})</option>
        @endforeach
    </select>
    <select id="topicSubjectSelect" class="form-input form-input-sm" onchange="loadTopics()" style="max-width:250px;">
        <option value="">-- Select Subject --</option>
    </select>
    <button class="btn btn-primary" onclick="showTopicModal()"><i class="fas fa-plus"></i> Add Topic</button>
</div>

<div class="table-responsive">
    <table class="table" id="topicsTable">
        <thead><tr><th>#</th><th>Topic Title</th><th>Description</th><th>Added By</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody><tr><td colspan="6" class="text-center"><i class="fas fa-tags"></i> Select a course and subject above</td></tr></tbody>
    </table>
</div>
@endsection

@push('scripts')
<script>
function escapeHtml(t){if(!t)return '';return $('<div>').text(t).html();}

function loadTopicSubjects(){
    var courseId=$('#topicCourseSelect').val();
    $('#topicSubjectSelect').html('<option value="">-- Select Subject --</option>');
    $('#topicsTable tbody').html('<tr><td colspan="6" class="text-center"><i class="fas fa-tags"></i> Select a course and subject above</td></tr>');
    if(!courseId) return;
    $.post('{{ route("api.subjects") }}',{courseId:courseId},function(res){
        if(res.status===200){
            var opts='<option value="">-- Select Subject --</option>';
            res.data.forEach(s=>{opts+='<option value="'+s.id+'">'+escapeHtml(s.title)+' ('+(s.code||'-')+')</option>';});
            $('#topicSubjectSelect').html(opts);
        }
    },'json');
}

function loadTopics(){
    var subjectId=$('#topicSubjectSelect').val();
    if(!subjectId){$('#topicsTable tbody').html('<tr><td colspan="6" class="text-center"><i class="fas fa-tags"></i> Select a subject above</td></tr>');return;}
    $.post('{{ route("api.topics") }}',{subjectId:subjectId},function(res){
        if(res.status===200){
            var html='';
            if(!res.data.length) html='<tr><td colspan="6" class="text-center">No topics found</td></tr>';
            else res.data.forEach(function(t,i){
                var badge=t.status==='active'?'badge-active':'badge-inactive';
                html+='<tr><td>'+(i+1)+'</td><td>'+escapeHtml(t.title)+'</td><td>'+escapeHtml(t.description||'-')+'</td><td>'+escapeHtml(t.creator?t.creator.name:'-')+'</td><td><span class="badge '+badge+'">'+t.status+'</span></td><td>'+
                '<button class="btn btn-sm btn-outline" data-id="'+t.id+'" data-title="'+escapeHtml(t.title)+'" data-desc="'+escapeHtml(t.description||'')+'" data-status="'+t.status+'" onclick="editTopic(this)"><i class="fas fa-edit"></i></button> '+
                '<button class="btn btn-sm btn-danger" onclick="deleteTopic('+t.id+')"><i class="fas fa-trash"></i></button></td></tr>';
            });
            $('#topicsTable tbody').html(html);
        }
    },'json');
}

function showTopicModal(){
    var subjectId=$('#topicSubjectSelect').val();
    if(!subjectId){Swal.fire('Select Subject','Please select a course and subject first','warning');return;}
    Swal.fire({title:'Add New Topic',html:
        '<div class="form-group"><label class="form-label">Title</label><input id="sw-tTitle" class="swal2-input" placeholder="Topic title"></div>'+
        '<div class="form-group"><label class="form-label">Description</label><textarea id="sw-tDesc" class="swal2-textarea" placeholder="Description"></textarea></div>'+
        '<div class="form-group"><label class="form-label">Status</label><select id="sw-tStatus" class="swal2-input"><option value="active">Active</option><option value="inactive">Inactive</option></select></div>',
        showCancelButton:true,confirmButtonText:'Add',
        preConfirm:()=>({subjectId:subjectId,title:document.getElementById('sw-tTitle').value.trim(),description:document.getElementById('sw-tDesc').value.trim(),status:document.getElementById('sw-tStatus').value})
    }).then(r=>{if(r.isConfirmed){$.post('{{ route("api.topics.store") }}',r.value,function(res){if(res.status===200){Swal.fire('Added',res.message,'success');loadTopics();}else Swal.fire('Error',res.message,'error');},'json');}});
}

function editTopic(el){
    var id=$(el).data('id'),title=$(el).data('title'),desc=$(el).data('desc'),status=$(el).data('status');
    Swal.fire({title:'Edit Topic',html:
        '<div class="form-group"><label class="form-label">Title</label><input id="sw-tTitle" class="swal2-input" value="'+escapeHtml(title)+'"></div>'+
        '<div class="form-group"><label class="form-label">Description</label><textarea id="sw-tDesc" class="swal2-textarea">'+escapeHtml(desc)+'</textarea></div>'+
        '<div class="form-group"><label class="form-label">Status</label><select id="sw-tStatus" class="swal2-input"><option value="active"'+(status==='active'?' selected':'')+'>Active</option><option value="inactive"'+(status==='inactive'?' selected':'')+'>Inactive</option></select></div>',
        showCancelButton:true,confirmButtonText:'Update',
        preConfirm:()=>({id:id,title:document.getElementById('sw-tTitle').value.trim(),description:document.getElementById('sw-tDesc').value.trim(),status:document.getElementById('sw-tStatus').value})
    }).then(r=>{if(r.isConfirmed){$.post('{{ route("api.topics.update") }}',r.value,function(res){if(res.status===200){Swal.fire('Updated',res.message,'success');loadTopics();}else Swal.fire('Error',res.message,'error');},'json');}});
}

function deleteTopic(id){
    Swal.fire({title:'Delete Topic?',icon:'warning',showCancelButton:true,confirmButtonColor:'#d33',confirmButtonText:'Delete'}).then(r=>{
        if(r.isConfirmed){$.post('{{ route("api.topics.delete") }}',{id:id},function(res){if(res.status===200){Swal.fire('Deleted',res.message,'success');loadTopics();}else Swal.fire('Error',res.message,'error');},'json');}
    });
}
</script>
@endpush
