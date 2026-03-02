@extends('layouts.guest')

@push('styles')
<link href="https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.5.13/cropper.min.css" rel="stylesheet">
<style>
    .reg-avatar-preview { width:150px;height:150px;border-radius:50%;background:var(--bg-surface);border:3px dashed var(--border-color);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .3s;position:relative;overflow:hidden; }
    .reg-avatar-preview:hover { border-color:var(--primary);transform:scale(1.05); }
    .reg-avatar-preview img { width:100%;height:100%;object-fit:cover; }
    .reg-avatar-overlay { position:absolute;bottom:0;left:0;width:100%;background:rgba(0,0,0,.7);color:#fff;font-size:.75rem;padding:8px 0;text-align:center;opacity:0;transition:.2s; }
    .reg-avatar-preview:hover .reg-avatar-overlay { opacity:1; }
    .reg-avatar-preview.has-image { border-style:solid;border-color:var(--primary); }
    .cropper-modal-overlay { display:none;position:fixed;z-index:10000;left:0;top:0;width:100%;height:100%;background:rgba(0,0,0,.9);backdrop-filter:blur(4px);align-items:center;justify-content:center;opacity:0;transition:opacity .3s ease; }
    .cropper-modal-overlay.show { opacity:1; }
    .cropper-content { background:var(--bg-surface);color:var(--text-main);padding:1.5rem;border-radius:var(--radius-lg);width:90%;max-width:500px;box-shadow:0 25px 50px -12px rgba(0,0,0,.5);border:1px solid var(--border-color);position:relative;display:flex;flex-direction:column;gap:1rem; }
    .cropper-header { display:flex;justify-content:space-between;align-items:center; }
    .cropper-header h3 { margin:0;font-size:1.15rem; }
    .img-container { height:350px;max-height:50vh;width:100%;background:#000;overflow:hidden;border-radius:var(--radius-sm);display:flex;align-items:center;justify-content:center; }
    .img-container img { max-width:100%;max-height:100%;display:block; }
    .cropper-actions { display:flex;justify-content:flex-end;gap:.75rem; }
</style>
@endpush

@section('content')
<div class="auth-wrapper">
    <div class="auth-brand-side">
        <div class="auth-brand-bg"></div>
        <div class="auth-brand-content">
            <div class="logo" style="font-size:3.5rem;justify-content:center;margin-bottom:1rem;">
                <span class="sparkle-icon" style="width:40px;height:40px;"></span> Azhagii
            </div>
            <p>Join your college learning community</p>
        </div>
    </div>
    <div class="auth-form-side reg-form-side">
        <a href="{{ route('home') }}" class="back-to-home"><i class="fas fa-arrow-left"></i> Home</a>
        <div class="auth-card reg-card">
            <div class="auth-header" style="margin-bottom:1rem;">
                <h2 style="font-size:1.4rem;">Create Account</h2>
                <p style="font-size:0.85rem;">Register as a student to get started</p>
            </div>

            <!-- Tab Navigation -->
            <div class="reg-tabs">
                <button type="button" class="reg-tab active" data-tab="1"><span class="reg-tab-num">1</span> Personal</button>
                <button type="button" class="reg-tab" data-tab="2"><span class="reg-tab-num">2</span> Additional</button>
                <button type="button" class="reg-tab" data-tab="3"><span class="reg-tab-num">3</span> Profile</button>
                <button type="button" class="reg-tab" data-tab="4"><span class="reg-tab-num">4</span> Account</button>
            </div>

            <form id="registerForm" autocomplete="off" enctype="multipart/form-data">
                <!-- TAB 1: Personal -->
                <div class="reg-tab-panel active" id="tabPanel1">
                    <div class="form-group">
                        <label class="form-label">Full Name <span class="req">*</span></label>
                        <input type="text" name="name" id="name" class="form-input" placeholder="Azhagii" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">College <span class="req">*</span></label>
                        <select name="collegeId" id="college" class="form-input" required>
                            <option value="">Select your college</option>
                            @foreach($colleges as $c)
                                <option value="{{ $c->id }}">{{ $c->name }} ({{ $c->code }})</option>
                            @endforeach
                        </select>
                    </div>
                    <div class="form-row">
                        <div class="form-group" style="flex:1;">
                            <label class="form-label">Department <span class="req">*</span></label>
                            <select name="department" id="department" class="form-input" required>
                                <option value="" disabled selected>Select Department</option>
                                <option value="AIDS">Artificial Intelligence and Data Science</option>
                                <option value="AIML">Artificial Intelligence and Machine Learning</option>
                                <option value="CYBER">Computer Science and Engineering (Cyber Security)</option>
                                <option value="CSE">Computer Science Engineering</option>
                                <option value="CSBS">Computer Science And Business Systems</option>
                                <option value="ECE">Electronics & Communication Engineering</option>
                                <option value="EEE">Electrical & Electronics Engineering</option>
                                <option value="MECH">Mechanical Engineering</option>
                                <option value="CIVIL">Civil Engineering</option>
                                <option value="IT">Information Technology</option>
                                <option value="VLSI">Electronics Engineering (VLSI Design)</option>
                            </select>
                        </div>
                        <div class="form-group" style="flex:1;">
                            <label class="form-label">Year <span class="req">*</span></label>
                            <select name="year" id="year" class="form-input" required>
                                <option value="">Select</option>
                                <option value="I year">I Year</option>
                                <option value="II year">II Year</option>
                                <option value="III year">III Year</option>
                                <option value="IV year">IV Year</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Roll Number <span class="req">*</span></label>
                        <input type="text" name="rollNumber" id="rollNumber" class="form-input" placeholder="Select dept & year first" required maxlength="12">
                        <small class="roll-feedback" id="rollFeedback"></small>
                    </div>
                    <div class="form-row">
                        <div class="form-group" style="flex:1.2;">
                            <label class="form-label">Email <span class="req">*</span></label>
                            <input type="email" name="email" id="email" class="form-input" placeholder="you@example.com" required>
                        </div>
                        <div class="form-group" style="flex:0.8;">
                            <label class="form-label">Phone <span class="req">*</span></label>
                            <input type="text" name="phone" id="phone" class="form-input" placeholder="+91 9876543210" required>
                        </div>
                    </div>
                    <button type="button" class="btn btn-primary btn-compact" id="btnNext" style="width:100%;justify-content:center;">Next <i class="fas fa-arrow-right"></i></button>
                </div>

                <!-- TAB 2: Additional -->
                <div class="reg-tab-panel" id="tabPanel2">
                    <div class="form-row">
                        <div class="form-group" style="flex:1;">
                            <label class="form-label">Gender</label>
                            <select name="gender" id="gender" class="form-input">
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div class="form-group" style="flex:1;">
                            <label class="form-label">Date of Birth</label>
                            <input type="date" name="dob" id="dob" class="form-input">
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Address</label>
                        <input type="text" name="address" id="address" class="form-input" placeholder="Your address">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Bio / Tagline</label>
                        <input type="text" name="bio" id="bio" class="form-input" placeholder="Tell us about yourself">
                    </div>
                    <div class="form-group">
                        <label class="form-label" style="margin-bottom:0.5rem;display:flex;align-items:center;gap:0.5rem;">
                            <i class="fas fa-share-alt" style="color:var(--accent-blue);"></i>
                            Social Profiles <span style="color:var(--text-muted);font-weight:normal;">(Optional)</span>
                        </label>
                    </div>
                    <div class="form-row">
                        <div class="form-group" style="flex:1;">
                            <label class="form-label"><i class="fab fa-github"></i> GitHub</label>
                            <input type="url" name="githubUrl" id="githubUrl" class="form-input" placeholder="https://github.com/username">
                        </div>
                        <div class="form-group" style="flex:1;">
                            <label class="form-label"><i class="fab fa-linkedin" style="color:#0077b5;"></i> LinkedIn</label>
                            <input type="url" name="linkedinUrl" id="linkedinUrl" class="form-input" placeholder="https://linkedin.com/in/username">
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group" style="flex:1;">
                            <label class="form-label"><i class="fab fa-hackerrank" style="color:#2ec866;"></i> HackerRank</label>
                            <input type="url" name="hackerrankUrl" id="hackerrankUrl" class="form-input" placeholder="https://hackerrank.com/username">
                        </div>
                        <div class="form-group" style="flex:1;">
                            <label class="form-label"><i class="fas fa-code" style="color:#ffa116;"></i> LeetCode</label>
                            <input type="url" name="leetcodeUrl" id="leetcodeUrl" class="form-input" placeholder="https://leetcode.com/username">
                        </div>
                    </div>
                    <div class="reg-btn-row">
                        <button type="button" class="btn btn-secondary btn-compact" id="btnBack1" style="flex:1;justify-content:center;"><i class="fas fa-arrow-left"></i> Back</button>
                        <button type="button" class="btn btn-primary btn-compact" id="btnNext2" style="flex:2;justify-content:center;">Next <i class="fas fa-arrow-right"></i></button>
                    </div>
                </div>

                <!-- TAB 3: Profile Photo -->
                <div class="reg-tab-panel" id="tabPanel3">
                    <div style="text-align:center;margin-bottom:1rem;">
                        <label class="form-label" style="font-size:1rem;color:var(--text-heading);margin-bottom:1rem;display:block;">
                            <i class="fas fa-camera" style="color:var(--accent-purple);"></i> Upload Profile Photo
                        </label>
                        <p style="font-size:0.85rem;color:var(--text-muted);margin-bottom:1.5rem;">Add a profile photo to personalize your account (Optional)</p>
                    </div>
                    <div style="display:flex;flex-direction:column;align-items:center;gap:1rem;">
                        <div class="reg-avatar-preview" id="regAvatarPreview" onclick="document.getElementById('profilePhotoInput').click()">
                            <i class="fas fa-camera" style="font-size:3rem;color:var(--text-muted);"></i>
                            <div class="reg-avatar-overlay">Click to Upload</div>
                        </div>
                        <input type="file" id="profilePhotoInput" name="profilePhoto" accept="image/*" style="display:none;">
                        <div style="text-align:center;">
                            <button type="button" class="btn btn-outline btn-compact" id="btnChangePhoto" style="display:none;" onclick="document.getElementById('profilePhotoInput').click()"><i class="fas fa-exchange-alt"></i> Change Photo</button>
                            <button type="button" class="btn btn-outline btn-compact" id="btnRemovePhoto" style="display:none;margin-left:0.5rem;" onclick="removePhoto()"><i class="fas fa-trash"></i> Remove</button>
                        </div>
                        <small style="color:var(--text-muted);font-size:0.8rem;">Recommended: Square image, at least 200x200px (Max 5MB)</small>
                    </div>
                    <div class="reg-btn-row" style="margin-top:2rem;">
                        <button type="button" class="btn btn-secondary btn-compact" id="btnBack2" style="flex:1;justify-content:center;"><i class="fas fa-arrow-left"></i> Back</button>
                        <button type="button" class="btn btn-primary btn-compact" id="btnNext3" style="flex:2;justify-content:center;">Next <i class="fas fa-arrow-right"></i></button>
                    </div>
                </div>

                <!-- TAB 4: Account -->
                <div class="reg-tab-panel" id="tabPanel4">
                    <div class="form-group">
                        <label class="form-label">Username <span class="req">*</span></label>
                        <input type="text" name="username" id="username" class="form-input" placeholder="Choose a unique username" required minlength="4">
                        <small class="field-hint">At least 4 characters, letters, numbers and underscores only</small>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Password <span class="req">*</span></label>
                        <div class="password-wrapper">
                            <input type="password" name="password" id="password" class="form-input" placeholder="Min 6 characters" required minlength="6">
                            <button type="button" class="pw-toggle" id="togglePw"><i class="fas fa-eye"></i></button>
                        </div>
                        <div class="pw-strength-bar" id="pwStrengthBar"><div class="pw-strength-fill" id="pwStrengthFill"></div></div>
                        <small class="pw-strength-text" id="pwStrengthText"></small>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Confirm Password <span class="req">*</span></label>
                        <div class="password-wrapper">
                            <input type="password" name="confirm_password" id="confirmPassword" class="form-input" placeholder="Re-enter your password" required minlength="6">
                            <button type="button" class="pw-toggle" id="toggleCpw"><i class="fas fa-eye"></i></button>
                        </div>
                        <small class="pw-match-feedback" id="pwMatchFeedback"></small>
                    </div>
                    <div class="pw-requirements pw-requirements-compact" id="pwRequirements">
                        <ul>
                            <li id="reqLen"><i class="fas fa-circle"></i> 6+ chars</li>
                            <li id="reqUpper"><i class="fas fa-circle"></i> Uppercase</li>
                            <li id="reqNum"><i class="fas fa-circle"></i> Number</li>
                            <li id="reqLower"><i class="fas fa-circle"></i> Lowercase</li>
                            <li id="reqSpecial"><i class="fas fa-circle"></i> Special</li>
                            <li id="reqMatch"><i class="fas fa-circle"></i> Match</li>
                        </ul>
                    </div>
                    <div class="reg-btn-row">
                        <button type="button" class="btn btn-secondary btn-compact" id="btnBack3" style="flex:1;justify-content:center;"><i class="fas fa-arrow-left"></i> Back</button>
                        <button type="submit" class="btn btn-primary btn-compact" id="btnRegister" style="flex:2;justify-content:center;" disabled><i class="fas fa-user-plus"></i> Register</button>
                    </div>
                </div>
            </form>

            <p style="text-align:center;margin-top:0.75rem;font-size:0.85rem;">
                Already have an account? <a href="{{ route('login') }}">Sign in</a>
            </p>
        </div>
    </div>
</div>

<!-- Cropper Modal -->
<div id="cropperModal" class="cropper-modal-overlay">
    <div class="cropper-content">
        <div class="cropper-header">
            <h3>Adjust Your Photo</h3>
            <button type="button" onclick="closeCropper()" style="background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:1.5rem;padding:0;width:30px;height:30px;"><i class="fas fa-times"></i></button>
        </div>
        <div class="img-container"><img id="imageToCrop" src="" alt="Crop Preview"></div>
        <div class="cropper-actions">
            <button type="button" class="btn btn-outline btn-compact" onclick="closeCropper()">Cancel</button>
            <button type="button" class="btn btn-primary btn-compact" onclick="applyCrop()"><i class="fas fa-check"></i> Apply</button>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<script src="https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.5.13/cropper.min.js"></script>
<script>
$(document).ready(function() { $('#cropperModal').appendTo('body'); });

(function() {
    const tabs = document.querySelectorAll('.reg-tab');
    const panels = document.querySelectorAll('.reg-tab-panel');
    function switchTab(num) {
        tabs.forEach(t => t.classList.toggle('active', t.dataset.tab == num));
        panels.forEach(p => p.classList.remove('active'));
        document.getElementById('tabPanel' + num).classList.add('active');
    }
    tabs.forEach(tab => { tab.addEventListener('click', function() { const t = parseInt(this.dataset.tab); if (t >= 2 && !validateTab1()) return; switchTab(t); }); });
    document.getElementById('btnNext').addEventListener('click', function() { if (validateTab1()) switchTab(2); });
    document.getElementById('btnNext2').addEventListener('click', function() { switchTab(3); });
    document.getElementById('btnNext3').addEventListener('click', function() { switchTab(4); });
    document.getElementById('btnBack1').addEventListener('click', function() { switchTab(1); });
    document.getElementById('btnBack2').addEventListener('click', function() { switchTab(2); });
    document.getElementById('btnBack3').addEventListener('click', function() { switchTab(3); });

    function validateTab1() {
        const name = document.getElementById('name').value.trim();
        const college = document.getElementById('college').value;
        const dept = document.getElementById('department').value;
        const year = document.getElementById('year').value;
        const roll = document.getElementById('rollNumber').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        if (!name) { showFieldError('name', 'Full name is required'); return false; }
        if (!college) { showFieldError('college', 'Please select your college'); return false; }
        if (!dept) { showFieldError('department', 'Please select your department'); return false; }
        if (!year) { showFieldError('year', 'Please select your year'); return false; }
        if (!roll || roll.length !== 12) { showFieldError('rollNumber', 'Valid 12-digit roll number is required'); return false; }
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showFieldError('email', 'Valid email is required'); return false; }
        if (!phone) { showFieldError('phone', 'Phone number is required'); return false; }
        return true;
    }
    function showFieldError(id, msg) {
        const el = document.getElementById(id); el.focus(); el.classList.add('input-error');
        Swal.fire({ icon:'warning', title:'Missing Info', text: msg, timer: 2000, showConfirmButton: false });
        setTimeout(() => el.classList.remove('input-error'), 3000);
    }

    // Profile Photo Cropping
    const profilePhotoInput = document.getElementById('profilePhotoInput');
    const regAvatarPreview = document.getElementById('regAvatarPreview');
    const btnChangePhoto = document.getElementById('btnChangePhoto');
    const btnRemovePhoto = document.getElementById('btnRemovePhoto');
    let cropper = null, croppedBlob = null;

    profilePhotoInput.addEventListener('change', function(e) {
        const file = e.target.files[0]; if (!file) return;
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedTypes.includes(file.type)) { Swal.fire({ icon:'error', title:'Invalid File', text:'Please upload a JPG, PNG, WEBP or GIF image' }); this.value = ''; return; }
        if (file.size > 5 * 1024 * 1024) { Swal.fire({ icon:'error', title:'File Too Large', text:'Maximum file size is 5MB' }); this.value = ''; return; }
        const reader = new FileReader();
        reader.onload = function(event) {
            $('#imageToCrop').attr('src', event.target.result);
            $('#cropperModal').css('display', 'flex'); void document.getElementById('cropperModal').offsetWidth; $('#cropperModal').addClass('show');
            setTimeout(() => {
                const image = document.getElementById('imageToCrop');
                if (cropper) cropper.destroy();
                cropper = new Cropper(image, { aspectRatio:1, viewMode:1, dragMode:'move', autoCropArea:1, background:false, responsive:true, restore:false, guides:true, center:true, highlight:false, cropBoxMovable:true, cropBoxResizable:true });
            }, 100);
        };
        reader.readAsDataURL(file);
    });

    function closeCropper() {
        $('#cropperModal').removeClass('show');
        setTimeout(() => { $('#cropperModal').hide(); if (cropper) { cropper.destroy(); cropper = null; } profilePhotoInput.value = ''; }, 300);
    }
    $(document).on('keydown', function(e) { if (e.key === 'Escape' && $('#cropperModal').hasClass('show')) closeCropper(); });

    function applyCrop() {
        if (cropper) {
            cropper.getCroppedCanvas({ width:400, height:400, fillColor:'#fff', imageSmoothingEnabled:true, imageSmoothingQuality:'high' }).toBlob((blob) => {
                croppedBlob = blob;
                const url = URL.createObjectURL(blob);
                regAvatarPreview.innerHTML = '<img src="' + url + '" alt="Preview"><div class="reg-avatar-overlay">Click to Change</div>';
                regAvatarPreview.classList.add('has-image');
                btnChangePhoto.style.display = 'inline-block'; btnRemovePhoto.style.display = 'inline-block';
                closeCropper();
            }, 'image/jpeg', 0.9);
        }
    }

    function removePhoto() {
        profilePhotoInput.value = '';
        regAvatarPreview.innerHTML = '<i class="fas fa-camera" style="font-size:3rem;color:var(--text-muted);"></i><div class="reg-avatar-overlay">Click to Upload</div>';
        regAvatarPreview.classList.remove('has-image');
        btnChangePhoto.style.display = 'none'; btnRemovePhoto.style.display = 'none'; croppedBlob = null;
    }
    window.removePhoto = removePhoto; window.closeCropper = closeCropper; window.applyCrop = applyCrop;

    // Roll Number Auto-Fill
    const departmentSelect = document.getElementById('department');
    const yearSelect = document.getElementById('year');
    const rollNumberInput = document.getElementById('rollNumber');
    let currentFixedPrefix = '', isRollPrefixLocked = false;
    const deptCodes = { 'AIDS':'BAD','AIML':'BAM','CSE':'BCS','CSBS':'BCB','CYBER':'BSC','ECE':'BEC','EEE':'BEE','MECH':'BME','CIVIL':'BCE','IT':'BIT','VLSI':'BEV' };
    const yearCodes = { 'I year':'927625','II year':'927624','III year':'927623','IV year':'927622' };

    rollNumberInput.addEventListener('input', function() { if (isRollPrefixLocked && currentFixedPrefix && !this.value.startsWith(currentFixedPrefix)) this.value = currentFixedPrefix; });
    rollNumberInput.addEventListener('keydown', function(e) { if (isRollPrefixLocked && currentFixedPrefix && this.selectionStart <= currentFixedPrefix.length && e.key === 'Backspace') e.preventDefault(); });

    function checkAutoFillRollNumber() {
        const dept = departmentSelect.value;
        if (dept === 'CYBER') {
            Array.from(yearSelect.options).forEach(opt => { if (opt.value === 'I year' || opt.value === '') { opt.style.display = 'block'; opt.disabled = false; } else { opt.style.display = 'none'; opt.disabled = true; } });
            if (yearSelect.value && yearSelect.value !== 'I year') yearSelect.value = 'I year';
        } else { Array.from(yearSelect.options).forEach(opt => { opt.style.display = 'block'; opt.disabled = false; }); }
        const year = yearSelect.value; let prefix = '';
        if (dept && year && yearCodes[year]) { const yCode = yearCodes[year]; let dCode = deptCodes[dept] || ''; if (dept === 'AIML' && year === 'IV year') dCode = 'BAL'; if (dCode) prefix = yCode + dCode; }
        if (prefix) { if (currentFixedPrefix !== prefix) rollNumberInput.value = prefix; else if (!rollNumberInput.value.startsWith(prefix)) rollNumberInput.value = prefix; currentFixedPrefix = prefix; isRollPrefixLocked = true; rollNumberInput.placeholder = prefix + '___'; }
        else { isRollPrefixLocked = false; currentFixedPrefix = ''; rollNumberInput.placeholder = 'Select dept & year first'; }
    }
    departmentSelect.addEventListener('change', checkAutoFillRollNumber);
    yearSelect.addEventListener('change', checkAutoFillRollNumber);

    let rollTimer; const rollDoneTypingInterval = 400; const rollFeedback = document.getElementById('rollFeedback');
    rollNumberInput.addEventListener('keyup', function() { clearTimeout(rollTimer); const val = this.value; if (!val) { rollFeedback.textContent = ''; rollFeedback.className = 'roll-feedback'; return; } rollTimer = setTimeout(() => { if (val.length === 12) { rollFeedback.textContent = '✓ Valid roll number format'; rollFeedback.className = 'roll-feedback valid'; } else { rollFeedback.textContent = '✗ Roll number must be 12 characters (' + val.length + '/12)'; rollFeedback.className = 'roll-feedback invalid'; } }, rollDoneTypingInterval); });

    // Password Validation
    const passwordInput = document.getElementById('password');
    const confirmInput = document.getElementById('confirmPassword');
    const strengthFill = document.getElementById('pwStrengthFill');
    const strengthText = document.getElementById('pwStrengthText');
    const matchFeedback = document.getElementById('pwMatchFeedback');
    const btnRegister = document.getElementById('btnRegister');
    const reqLen = document.getElementById('reqLen'), reqUpper = document.getElementById('reqUpper'), reqLower = document.getElementById('reqLower'), reqNum = document.getElementById('reqNum'), reqSpecial = document.getElementById('reqSpecial'), reqMatch = document.getElementById('reqMatch');

    function checkRequirements(pw) { const c = { len:pw.length>=6, upper:/[A-Z]/.test(pw), lower:/[a-z]/.test(pw), num:/[0-9]/.test(pw), special:/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pw) }; setReqState(reqLen,c.len); setReqState(reqUpper,c.upper); setReqState(reqLower,c.lower); setReqState(reqNum,c.num); setReqState(reqSpecial,c.special); return c; }
    function setReqState(el, passed) { const icon = el.querySelector('i'); if (passed) { el.classList.add('passed'); el.classList.remove('failed'); icon.className = 'fas fa-check-circle'; } else { el.classList.remove('passed'); el.classList.add('failed'); icon.className = 'fas fa-circle'; } }
    function getStrength(pw) { let s=0; if(pw.length>=6)s++; if(pw.length>=10)s++; if(/[A-Z]/.test(pw))s++; if(/[a-z]/.test(pw))s++; if(/[0-9]/.test(pw))s++; if(/[^a-zA-Z0-9]/.test(pw))s++; return s; }
    function updateStrengthBar(pw) { if (!pw) { strengthFill.style.width='0%'; strengthFill.className='pw-strength-fill'; strengthText.textContent=''; return; } const s=getStrength(pw); const pct=Math.round((s/6)*100); strengthFill.style.width=pct+'%'; if(s<=2){strengthFill.className='pw-strength-fill weak';strengthText.textContent='Weak';strengthText.style.color='#ef4444';}else if(s<=4){strengthFill.className='pw-strength-fill medium';strengthText.textContent='Medium';strengthText.style.color='#f59e0b';}else{strengthFill.className='pw-strength-fill strong';strengthText.textContent='Strong';strengthText.style.color='#22c55e';} }
    function checkPasswordMatch() { const pw=passwordInput.value,cpw=confirmInput.value; let match=false; if(!cpw){matchFeedback.textContent='';matchFeedback.className='pw-match-feedback';}else if(pw===cpw){matchFeedback.textContent='✓ Passwords match';matchFeedback.className='pw-match-feedback match';match=true;}else{matchFeedback.textContent='✗ Passwords do not match';matchFeedback.className='pw-match-feedback no-match';} setReqState(reqMatch,match); return match; }
    function updateRegisterButton() { const pw=passwordInput.value; const c=checkRequirements(pw); const allPassed=c.len&&c.upper&&c.lower&&c.num&&c.special; const matching=checkPasswordMatch(); const username=document.getElementById('username').value.trim(); btnRegister.disabled=!(allPassed&&matching&&username.length>=4); }
    passwordInput.addEventListener('input', function() { updateStrengthBar(this.value); checkRequirements(this.value); updateRegisterButton(); });
    confirmInput.addEventListener('input', updateRegisterButton);
    document.getElementById('username').addEventListener('input', updateRegisterButton);
    document.getElementById('togglePw').addEventListener('click', function() { const inp=document.getElementById('password'); const icon=this.querySelector('i'); if(inp.type==='password'){inp.type='text';icon.className='fas fa-eye-slash';}else{inp.type='password';icon.className='fas fa-eye';} });
    document.getElementById('toggleCpw').addEventListener('click', function() { const inp=document.getElementById('confirmPassword'); const icon=this.querySelector('i'); if(inp.type==='password'){inp.type='text';icon.className='fas fa-eye-slash';}else{inp.type='password';icon.className='fas fa-eye';} });

    // Form Submit
    $('#registerForm').submit(function(e) {
        e.preventDefault();
        const pw = $('#password').val(), cpw = $('#confirmPassword').val();
        if (pw !== cpw) { Swal.fire({ icon:'error', title:'Mismatch', text:'Passwords do not match' }); return; }
        const btn = $('#btnRegister');
        btn.prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i> Registering...');
        const formData = new FormData();
        formData.append('_token', '{{ csrf_token() }}');
        formData.append('register_student', '1');
        formData.append('name', $('#name').val());
        formData.append('email', $('#email').val());
        formData.append('username', $('#username').val());
        formData.append('password', pw);
        formData.append('collegeId', $('#college').val());
        formData.append('department', $('#department').val());
        formData.append('year', $('#year').val());
        formData.append('rollNumber', $('#rollNumber').val());
        formData.append('phone', $('#phone').val());
        formData.append('gender', $('#gender').val());
        formData.append('dob', $('#dob').val());
        formData.append('address', $('#address').val());
        formData.append('bio', $('#bio').val());
        formData.append('githubUrl', $('#githubUrl').val());
        formData.append('linkedinUrl', $('#linkedinUrl').val());
        formData.append('hackerrankUrl', $('#hackerrankUrl').val());
        formData.append('leetcodeUrl', $('#leetcodeUrl').val());
        if (croppedBlob) formData.append('profilePhoto', croppedBlob, 'profile.jpg');

        $.ajax({
            url: '{{ route("register") }}',
            type: 'POST',
            data: formData,
            processData: false,
            contentType: false,
            dataType: 'json',
            success: function(res) {
                if (res.status === 200) {
                    Swal.fire({ icon:'success', title:'Registered!', text:res.message, timer:2000, showConfirmButton:false }).then(() => window.location.href = '{{ route("dashboard.student") }}');
                } else {
                    Swal.fire({ icon:'error', title:'Failed', text:res.message });
                    btn.prop('disabled', false).html('<i class="fas fa-user-plus"></i> Register');
                }
            },
            error: function() {
                Swal.fire({ icon:'error', title:'Error', text:'Connection failed' });
                btn.prop('disabled', false).html('<i class="fas fa-user-plus"></i> Register');
            }
        });
    });
})();
</script>
@endpush
