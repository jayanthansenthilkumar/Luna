@extends('layouts.app')

@section('content')
<div class="section-toolbar">
    <select id="contentCourseSelect" class="form-input form-input-sm" onchange="loadContent()" style="max-width:300px;">
        <option value="">-- Select Course --</option>
        @foreach($courses as $c)
            <option value="{{ $c->id }}">{{ $c->title }} ({{ $c->courseCode }})</option>
        @endforeach
    </select>
    <button class="btn btn-primary" onclick="showContentModal()"><i class="fas fa-plus"></i> Add Content</button>
</div>

<div id="contentList" class="content-list">
    <div class="text-center" style="padding:3rem;">
        <i class="fas fa-layer-group" style="font-size:3rem;opacity:0.3;"></i>
        <p style="margin-top:1rem;opacity:0.6;">Select a course above to manage content</p>
    </div>
</div>
@endsection

@push('scripts')
<script>
function escapeHtml(t){if(!t)return '';return $('<div>').text(t).html();}

function loadContent(){
    var courseId=$('#contentCourseSelect').val();
    if(!courseId){$('#contentList').html('<div class="text-center" style="padding:3rem;"><i class="fas fa-layer-group" style="font-size:3rem;opacity:0.3;"></i><p style="margin-top:1rem;opacity:0.6;">Select a course above to manage content</p></div>');return;}
    $.post('{{ route("api.content") }}',{courseId:courseId},function(res){
        if(res.status===200){
            if(!res.data.length){$('#contentList').html('<div class="text-center" style="padding:3rem;"><p>No content found for this course.</p></div>');return;}
            var html='';
            res.data.forEach(function(c){
                var icon=c.contentType==='video'?'fa-video':c.contentType==='pdf'?'fa-file-pdf':c.contentType==='text'?'fa-align-left':'fa-file';
                html+='<div class="card mb-3 p-3" style="display:flex;align-items:center;gap:1rem;">'+
                    '<div style="width:40px;height:40px;border-radius:8px;display:flex;align-items:center;justify-content:center;background:rgba(66,133,244,0.1);color:#4285f4;"><i class="fas '+icon+'"></i></div>'+
                    '<div style="flex:1;"><strong>'+escapeHtml(c.title)+'</strong><br><small style="opacity:0.6;">'+(c.subject?c.subject.title:'General')+' &bull; '+c.contentType+'</small></div>'+
                    '<div><button class="btn btn-sm btn-outline" onclick="editContent('+c.id+')"><i class="fas fa-edit"></i></button> '+
                    '<button class="btn btn-sm btn-danger" onclick="deleteContent('+c.id+')"><i class="fas fa-trash"></i></button></div></div>';
            });
            $('#contentList').html(html);
        }
    },'json');
}

function showContentModal(){
    var courseId=$('#contentCourseSelect').val();
    if(!courseId){Swal.fire('Select Course','Please select a course first','warning');return;}
    $.post('{{ route("api.subjects") }}',{courseId:courseId},function(res){
        var subOpts='<option value="">General (No Subject)</option>';
        if(res.status===200) res.data.forEach(s=>{subOpts+='<option value="'+s.id+'">'+escapeHtml(s.title)+'</option>';});
        Swal.fire({title:'Add Content',width:600,html:
            '<div class="form-group"><label class="form-label">Title *</label><input id="sw-ctTitle" class="swal2-input" placeholder="Content title"></div>'+
            '<div class="form-group"><label class="form-label">Subject/Unit</label><select id="sw-ctSubject" class="swal2-input">'+subOpts+'</select></div>'+
            '<div class="form-group"><label class="form-label">Type</label><select id="sw-ctType" class="swal2-input" onchange="toggleContentInputs(this.value)"><option value="video">Video</option><option value="pdf">PDF</option><option value="text">Text</option></select></div>'+
            '<div id="grp-url" class="form-group"><label class="form-label">Video URL</label><input id="sw-ctUrl" class="swal2-input" placeholder="YouTube or video URL"></div>'+
            '<div id="grp-file" class="form-group" style="display:none"><label class="form-label">Upload File</label><input type="file" id="sw-ctFile" class="swal2-input" accept=".pdf"></div>'+
            '<div id="grp-text" class="form-group" style="display:none"><label class="form-label">Rich Text</label><textarea id="sw-ctText" class="swal2-textarea" placeholder="Enter text content"></textarea></div>'+
            '<div class="form-group"><label class="form-label">Description</label><textarea id="sw-ctDesc" class="swal2-textarea" placeholder="Description"></textarea></div>',
            showCancelButton:true,confirmButtonText:'Add',
            preConfirm:()=>{
                var title=document.getElementById('sw-ctTitle').value.trim();
                if(!title){Swal.showValidationMessage('Title required');return false;}
                var fd=new FormData();
                fd.append('courseId',courseId);fd.append('title',title);
                fd.append('subjectId',document.getElementById('sw-ctSubject').value);
                var type=document.getElementById('sw-ctType').value;
                fd.append('contentType',type);
                fd.append('description',document.getElementById('sw-ctDesc').value.trim());
                if(type==='video') fd.append('contentData',document.getElementById('sw-ctUrl').value.trim());
                else if(type==='text') fd.append('contentData',document.getElementById('sw-ctText').value.trim());
                else if(type==='pdf'){var f=document.getElementById('sw-ctFile').files[0];if(f) fd.append('content_file',f);}
                return fd;
            }
        }).then(r=>{if(r.isConfirmed){
            $.ajax({url:'{{ route("api.content.store") }}',type:'POST',data:r.value,processData:false,contentType:false,headers:{'X-CSRF-TOKEN':CSRF_TOKEN},success:function(res){if(res.status===200){Swal.fire('Added',res.message,'success');loadContent();}else Swal.fire('Error',res.message,'error');},dataType:'json'});
        }});
    },'json');
}

function toggleContentInputs(type){
    document.getElementById('grp-url').style.display=type==='video'?'':'none';
    document.getElementById('grp-file').style.display=type==='pdf'?'':'none';
    document.getElementById('grp-text').style.display=type==='text'?'':'none';
}

function editContent(id){Swal.fire('Info','Edit functionality coming soon','info');}

function deleteContent(id){
    Swal.fire({title:'Delete Content?',icon:'warning',showCancelButton:true,confirmButtonColor:'#d33',confirmButtonText:'Delete'}).then(r=>{
        if(r.isConfirmed){$.post('{{ route("api.content.delete") }}',{id:id},function(res){if(res.status===200){Swal.fire('Deleted',res.message,'success');loadContent();}else Swal.fire('Error',res.message,'error');},'json');}
    });
}
</script>
@endpush
