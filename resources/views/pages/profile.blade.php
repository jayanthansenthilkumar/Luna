@extends('layouts.app')

@push('styles')
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.5.13/cropper.min.css">
<style>
    .content-wrapper{padding-top:5rem!important;padding-bottom:0.75rem!important}
    .profile-dashboard-grid{display:grid;grid-template-columns:280px 1fr;gap:0.75rem}
    .profile-card{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:1.25rem;transition:all .2s}
    .profile-card:hover{border-color:rgba(66,133,244,0.3)}
    .profile-avatar-lg{width:80px;height:80px;border-radius:50%;border:3px solid var(--border);overflow:hidden;margin:0 auto 0.75rem;cursor:pointer;position:relative;box-shadow:0 4px 12px rgba(0,0,0,0.2)}
    .profile-avatar-lg img{width:100%;height:100%;object-fit:cover}
    .upload-overlay{position:absolute;bottom:0;left:0;right:0;background:rgba(0,0,0,0.6);color:#fff;text-align:center;font-size:0.7rem;padding:4px;opacity:0;transition:opacity .2s}
    .profile-avatar-lg:hover .upload-overlay{opacity:1}
    .user-name-lg{font-size:1.1rem;font-weight:700;text-align:center;margin-bottom:0.25rem}
    .user-role-badge{text-align:center;font-size:0.75rem;opacity:0.6;margin-bottom:0.75rem}
    .profile-progress-wrap{margin-top:1rem}
    .form-input-profile{width:100%;padding:0.6rem 0.75rem;border:1px solid var(--border);border-radius:8px;background:var(--surface);color:var(--text);font-size:0.9rem}
    .social-input-group{position:relative}
    .social-input-group i{position:absolute;left:12px;top:50%;transform:translateY(-50%);font-size:1rem;z-index:1}
    .social-input-group input{padding-left:36px!important}
    .cropper-modal-overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.85);backdrop-filter:blur(4px);z-index:99999;display:flex;align-items:center;justify-content:center}
    .cropper-modal-content{background:var(--surface);border-radius:12px;padding:1.5rem;max-width:500px;width:90%}
    .img-container{max-height:400px;overflow:hidden}
    .img-container img{max-width:100%;display:block}
    @media(max-width:1100px){.profile-dashboard-grid{grid-template-columns:1fr}}
</style>
@endpush

@section('content')
<form id="profileForm" class="profile-dashboard-grid">
    {{-- Left Column --}}
    <div class="profile-col">
        <div class="profile-card identity-wrapper" style="text-align:center;">
            <div class="profile-avatar-lg" id="profileAvatarDisplay" onclick="{{ $isLocked ? '' : 'document.getElementById(\'profilePhoto\').click()' }}">
                @if($u->profilePhoto)
                    <img src="{{ asset($u->profilePhoto) }}" alt="Profile">
                @else
                    <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:rgba(66,133,244,0.15);color:#4285f4;font-size:2rem;font-weight:700;">{{ strtoupper(substr($u->name,0,1)) }}</div>
                @endif
                @unless($isLocked)<div class="upload-overlay">Change</div>@endunless
            </div>
            <input type="file" id="profilePhoto" accept="image/*" style="display:none;" onchange="previewImage(this)">
            <div class="user-name-lg" id="displayNameHeader">{{ $u->name }}</div>
            <div class="user-role-badge" id="displayAzhagiiID">{{ $u->role }} {{ $u->azhagiiID ? '• '.$u->azhagiiID : '' }}</div>
            @if($u->department)<p style="font-size:0.8rem;opacity:0.5;">{{ $u->department }} {{ $u->year ? '• Year '.$u->year : '' }}</p>@endif

            <div class="profile-progress-wrap">
                <div style="height:6px;background:rgba(255,255,255,0.1);border-radius:3px;overflow:hidden;">
                    <div style="width:{{ $pct }}%;height:100%;background:{{ $pct >= 100 ? '#4ade80' : '#4285f4' }};border-radius:3px;transition:width .3s;"></div>
                </div>
                <p style="font-size:0.8rem;margin-top:0.5rem;opacity:0.6;">{{ $pct }}% complete</p>
                @if($isLocked)<p style="font-size:0.75rem;color:#f87171;margin-top:0.25rem;"><i class="fas fa-lock"></i> Profile Locked</p>@endif
            </div>

            <div style="margin-top:1rem;">
                @if($isLocked)
                    <button type="button" class="btn btn-warning" style="width:100%;" onclick="requestUnlock()"><i class="fas fa-lock-open"></i> Request Edit</button>
                @else
                    <button type="submit" class="btn btn-primary" style="width:100%;"><i class="fas fa-save"></i> Save Changes</button>
                @endif
            </div>
        </div>

        <div class="profile-card" style="margin-top:0.75rem;">
            <h3 style="display:flex;align-items:center;gap:0.5rem;margin-bottom:1rem;"><i class="fas fa-lock" style="color:#f472b6;"></i> Security</h3>
            <div class="form-group">
                <label class="form-label">New Password (optional)</label>
                <input type="password" name="password" class="form-input form-input-profile" placeholder="Leave blank to keep current" {{ $isLocked ? 'disabled' : '' }}>
            </div>
        </div>
    </div>

    {{-- Right Column --}}
    <div class="profile-col">
        <div class="profile-card">
            <h3 style="display:flex;align-items:center;gap:0.5rem;margin-bottom:1rem;"><i class="fas fa-user-circle" style="color:#a78bfa;"></i> Personal & Academic Details</h3>
            <div class="responsive-grid-2">
                <div class="form-group">
                    <label class="form-label">Full Name *</label>
                    <input type="text" name="name" class="form-input form-input-profile" value="{{ $u->name }}" {{ $isLocked ? 'disabled' : '' }}>
                </div>
                <div class="form-group">
                    <label class="form-label">Phone Number</label>
                    <input type="text" name="phone" class="form-input form-input-profile" value="{{ $u->phone }}" {{ $isLocked ? 'disabled' : '' }}>
                </div>
            </div>
            <div class="responsive-grid-2">
                <div class="form-group">
                    <label class="form-label">Gender</label>
                    <select name="gender" class="form-input form-input-profile" {{ $isLocked ? 'disabled' : '' }}>
                        <option value="">Select</option>
                        <option value="Male" {{ $u->gender == 'Male' ? 'selected' : '' }}>Male</option>
                        <option value="Female" {{ $u->gender == 'Female' ? 'selected' : '' }}>Female</option>
                        <option value="Other" {{ $u->gender == 'Other' ? 'selected' : '' }}>Other</option>
                    </select>
                </div>
                <div class="form-group">
                    <label class="form-label">Date of Birth</label>
                    <input type="date" name="dob" class="form-input form-input-profile" value="{{ $u->dob ? $u->dob->format('Y-m-d') : '' }}" {{ $isLocked ? 'disabled' : '' }}>
                </div>
            </div>
            <div class="responsive-grid-2">
                <div class="form-group">
                    <label class="form-label">Address</label>
                    <input type="text" name="address" class="form-input form-input-profile" value="{{ $u->address }}" {{ $isLocked ? 'disabled' : '' }}>
                </div>
                <div class="form-group">
                    <label class="form-label">Bio / Tagline</label>
                    <input type="text" name="bio" class="form-input form-input-profile" value="{{ $u->bio }}" {{ $isLocked ? 'disabled' : '' }}>
                </div>
            </div>
            <div class="responsive-grid-3">
                <div class="form-group">
                    <label class="form-label">Username</label>
                    <input type="text" class="form-input form-input-profile" value="{{ $u->username }}" disabled>
                </div>
                <div class="form-group">
                    <label class="form-label">Email Address</label>
                    <input type="email" class="form-input form-input-profile" value="{{ $u->email }}" disabled>
                </div>
                <div class="form-group">
                    <label class="form-label">College</label>
                    <input type="text" class="form-input form-input-profile" value="{{ $u->college->name ?? 'N/A' }}" disabled>
                </div>
            </div>

            @if($u->role === 'azhagiiStudents')
            <div id="studentFields" class="responsive-grid-4">
                <div class="form-group">
                    <label class="form-label">Azhagii ID</label>
                    <input type="text" class="form-input form-input-profile" value="{{ $u->azhagiiID }}" disabled>
                </div>
                <div class="form-group">
                    <label class="form-label">Department</label>
                    <input type="text" class="form-input form-input-profile" value="{{ $u->department }}" disabled>
                </div>
                <div class="form-group">
                    <label class="form-label">Year</label>
                    <input type="text" class="form-input form-input-profile" value="{{ $u->year }}" disabled>
                </div>
                <div class="form-group">
                    <label class="form-label">Roll No</label>
                    <input type="text" class="form-input form-input-profile" value="{{ $u->rollNumber }}" disabled>
                </div>
            </div>
            @endif
        </div>

        <div class="profile-card" style="margin-top:0.75rem;">
            <h3 style="display:flex;align-items:center;gap:0.5rem;margin-bottom:1rem;"><i class="fas fa-share-alt" style="color:#60a5fa;"></i> Social Profiles</h3>
            <div class="responsive-grid-4">
                <div class="form-group social-input-group">
                    <i class="fab fa-github"></i>
                    <input type="url" name="githubUrl" class="form-input form-input-profile" value="{{ $u->githubUrl }}" placeholder="https://github.com/..." {{ $isLocked ? 'disabled' : '' }}>
                </div>
                <div class="form-group social-input-group">
                    <i class="fab fa-linkedin" style="color:#0077b5;"></i>
                    <input type="url" name="linkedinUrl" class="form-input form-input-profile" value="{{ $u->linkedinUrl }}" placeholder="https://linkedin.com/..." {{ $isLocked ? 'disabled' : '' }}>
                </div>
                <div class="form-group social-input-group">
                    <i class="fab fa-hackerrank" style="color:#2ec866;"></i>
                    <input type="url" name="hackerrankUrl" class="form-input form-input-profile" value="{{ $u->hackerrankUrl }}" placeholder="https://hackerrank.com/..." {{ $isLocked ? 'disabled' : '' }}>
                </div>
                <div class="form-group social-input-group">
                    <i class="fas fa-code" style="color:#ffa116;"></i>
                    <input type="url" name="leetcodeUrl" class="form-input form-input-profile" value="{{ $u->leetcodeUrl }}" placeholder="https://leetcode.com/..." {{ $isLocked ? 'disabled' : '' }}>
                </div>
            </div>
        </div>
    </div>
</form>

{{-- Cropper Modal --}}
<div id="cropperModal" class="cropper-modal-overlay" style="display:none;">
    <div class="cropper-modal-content">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;">
            <h3 style="margin:0;">Adjust Image</h3>
            <button type="button" class="btn btn-sm btn-outline" onclick="closeCropper()"><i class="fas fa-times"></i></button>
        </div>
        <div class="img-container">
            <img id="imageToCrop" src="" alt="Crop">
        </div>
        <div style="display:flex;gap:0.75rem;margin-top:1rem;justify-content:flex-end;">
            <button type="button" class="btn btn-outline" onclick="closeCropper()">Cancel</button>
            <button type="button" class="btn btn-primary" onclick="cropAndSave()"><i class="fas fa-check"></i> Save Photo</button>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<script src="https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.5.13/cropper.min.js"></script>
<script>
var cropper = null;
var croppedBlob = null;

$(document).ready(function(){
    // Move cropper modal to body for z-index
    $('#cropperModal').appendTo('body');

    // Check for incomplete flag
    var params = new URLSearchParams(window.location.search);
    if(params.get('incomplete')){
        Swal.fire({icon:'info',title:'Complete Your Profile',text:'Please fill in all required fields to access the dashboard.',toast:true,position:'top-end',showConfirmButton:false,timer:5000});
    }

    // Profile form submit
    $('#profileForm').on('submit',function(e){
        e.preventDefault();
        var fd = new FormData(this);
        if(croppedBlob) fd.append('profilePhoto', croppedBlob, 'profile.jpg');
        $.ajax({url:'{{ route("api.profile.update") }}',type:'POST',data:fd,processData:false,contentType:false,headers:{'X-CSRF-TOKEN':CSRF_TOKEN},success:function(res){
            if(res.status===200) Swal.fire('Saved',res.message,'success').then(()=>location.reload());
            else Swal.fire('Error',res.message,'error');
        },dataType:'json'});
    });
});

function previewImage(input){
    if(!input.files||!input.files[0]) return;
    var reader = new FileReader();
    reader.onload = function(e){
        $('#imageToCrop').attr('src', e.target.result);
        $('#cropperModal').show();
        setTimeout(function(){
            if(cropper) cropper.destroy();
            cropper = new Cropper(document.getElementById('imageToCrop'),{
                aspectRatio:1, viewMode:1, dragMode:'move', autoCropArea:1, background:false
            });
        },100);
    };
    reader.readAsDataURL(input.files[0]);
}

function closeCropper(){
    $('#cropperModal').hide();
    if(cropper){cropper.destroy();cropper=null;}
    $('#profilePhoto').val('');
}

function cropAndSave(){
    if(!cropper) return;
    cropper.getCroppedCanvas({width:400,height:400}).toBlob(function(blob){
        croppedBlob = blob;
        var fd = new FormData();
        fd.append('profilePhoto', blob, 'profile.jpg');
        $.ajax({url:'{{ route("api.profile.photo") }}',type:'POST',data:fd,processData:false,contentType:false,headers:{'X-CSRF-TOKEN':CSRF_TOKEN},success:function(res){
            if(res.status===200){
                // Update avatar display
                var url = URL.createObjectURL(blob);
                $('#profileAvatarDisplay').html('<img src="'+url+'" alt="Profile"><div class="upload-overlay">Change</div>');
                closeCropper();
                Swal.fire({icon:'success',title:'Photo Updated',toast:true,position:'top-end',showConfirmButton:false,timer:2000});
            } else Swal.fire('Error',res.message,'error');
        },dataType:'json'});
    },'image/jpeg',0.9);
}

function requestUnlock(){
    Swal.fire({title:'Request Profile Edit',input:'textarea',inputLabel:'Why is an edit needed?',inputPlaceholder:'Enter your reason...',inputValidator:v=>{if(!v)return 'Please provide a reason';},showCancelButton:true,confirmButtonText:'Submit Request'}).then(r=>{
        if(r.isConfirmed){$.post('{{ route("api.profile.request-unlock") }}',{reason:r.value},function(res){if(res.status===200)Swal.fire('Requested',res.message,'success').then(()=>location.reload());else Swal.fire('Error',res.message,'error');},'json');}
    });
}
</script>
@endpush
