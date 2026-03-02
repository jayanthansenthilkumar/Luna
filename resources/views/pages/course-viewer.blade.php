<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>{{ $course->title }} - Course Viewer</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Google+Sans:wght@400;500;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
    <link rel="stylesheet" href="{{ asset('assets/css/style.css') }}">
    <style>
        .content-wrapper{padding:0!important;margin:0!important;max-width:100%!important;height:100vh;overflow:hidden}
        .course-viewer-layout{display:grid;grid-template-columns:350px 1fr;height:100vh}
        .cv-sidebar{background:#1a1b23;display:flex;flex-direction:column;height:100vh;overflow:hidden}
        .cv-header{background:#15161c;padding:1.25rem;display:flex;flex-direction:column;gap:0.75rem}
        .btn-back{width:32px;height:32px;border-radius:50%;background:rgba(255,255,255,0.1);display:flex;align-items:center;justify-content:center;color:#fff;text-decoration:none;font-size:0.85rem;transition:background .2s}
        .btn-back:hover{background:rgba(255,255,255,0.2)}
        .cv-header h2{font-size:1.1rem;margin:0;color:#fff;font-weight:600}
        .progress-bar-sm{height:4px;background:rgba(255,255,255,0.1);border-radius:2px;overflow:hidden;margin-top:0.5rem}
        .progress-fill{height:100%;background:#4ade80;border-radius:2px;transition:width .3s}
        .cv-modules{flex:1;overflow-y:auto;padding:0.5rem 0}
        .cv-module-header{padding:1rem 1.25rem;cursor:pointer;display:flex;justify-content:space-between;align-items:center;color:rgba(255,255,255,0.8);font-weight:500;font-size:0.9rem;background:#1a1b23;transition:background .2s}
        .cv-module-header:hover{background:rgba(255,255,255,0.05)}
        .cv-module-content{display:none;padding-bottom:0.5rem}
        .cv-module.active .cv-module-content{display:block}
        .cv-topic-item{display:flex;align-items:center;gap:0.75rem;padding:0.6rem 1.25rem 0.6rem 2rem;cursor:pointer;color:rgba(255,255,255,0.6);border-left:3px solid transparent;font-size:0.85rem;transition:all .2s}
        .cv-topic-item:hover{background:rgba(255,255,255,0.05);color:rgba(255,255,255,0.9)}
        .cv-topic-item.active{background:rgba(66,133,244,0.1);border-left-color:#4285f4;color:#fff}
        .cv-topic-item .text-success{color:#4ade80!important}
        .cv-content{background:#0f1014;overflow-y:auto;display:flex;flex-direction:column}
        .video-wrapper{position:relative;padding-bottom:56.25%;height:0;background:#000}
        .video-wrapper iframe{position:absolute;top:0;left:0;width:100%;height:100%;border:0}
        .topic-details{padding:2rem;max-width:900px;margin:0 auto;width:100%}
        .topic-details h2{margin:0 0 0.5rem;font-size:1.3rem;color:#fff}
        .topic-details .topic-desc{color:rgba(255,255,255,0.7);line-height:1.7;margin-top:1rem}
        #btnMarkComplete{background:#10b981;color:#fff;border:none}
        #btnCompleted{background:rgba(16,185,129,0.2);color:#10b981;border:none;cursor:default}
        @media(max-width:768px){
            .course-viewer-layout{grid-template-columns:1fr;grid-template-rows:auto 1fr}
            .cv-sidebar{max-height:40vh;overflow-y:auto}
            .video-wrapper{position:sticky;top:0;z-index:10}
        }
    </style>
</head>
<body>
    <div class="course-viewer-layout">
        {{-- Left Sidebar --}}
        <div class="cv-sidebar">
            <div class="cv-header">
                <div style="display:flex;align-items:center;gap:0.75rem;">
                    <a href="{{ route('my-learning') }}" class="btn-back"><i class="fas fa-arrow-left"></i></a>
                    <h2>{{ $course->title }}</h2>
                </div>
                <div class="progress-bar-sm">
                    <div class="progress-fill" id="cvProgressBar" style="width:{{ $enrollment->progress }}%"></div>
                </div>
                <span style="font-size:0.8rem;color:rgba(255,255,255,0.5);" id="cvProgressText">{{ $enrollment->progress }}% Complete</span>
            </div>
            <div class="cv-modules">
                @foreach($subjects as $si => $subject)
                <div class="cv-module {{ $si === 0 ? 'active' : '' }}">
                    <div class="cv-module-header" onclick="toggleModule(this)">
                        <span>Unit {{ $si + 1 }}: {{ $subject->title }}</span>
                        <i class="fas fa-chevron-down"></i>
                    </div>
                    <div class="cv-module-content">
                        @foreach($subject->topicsList as $topic)
                        <div class="cv-topic-item" onclick="loadTopic({{ $topic->id }}, this)"
                             data-topic-id="{{ $topic->id }}"
                             data-video="{{ $topic->videoUrl ?? '' }}"
                             data-title="{{ $topic->title }}"
                             data-desc="{{ $topic->description ?? '' }}">
                            <i class="fas {{ in_array($topic->id, $completedTopics) ? 'fa-check-circle text-success' : 'fa-play-circle' }}"></i>
                            <span>{{ $topic->title }}</span>
                        </div>
                        @endforeach
                    </div>
                </div>
                @endforeach
            </div>
        </div>

        {{-- Right Content --}}
        <div class="cv-content">
            <div id="playerEmptyState" style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;">
                <i class="fas fa-play-circle" style="font-size:4rem;opacity:0.2;"></i>
                <p style="margin-top:1rem;opacity:0.5;">Select a topic to start learning</p>
            </div>
            <div id="playerContainer" style="display:none;">
                <div class="video-wrapper">
                    <iframe id="mainVideo" src="" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                </div>
                <div class="topic-details">
                    <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:1rem;">
                        <h2 id="topicTitle"></h2>
                        <div>
                            <button id="btnMarkComplete" class="btn btn-sm" onclick="markTopicComplete()"><i class="fas fa-check"></i> Mark Complete</button>
                            <button id="btnCompleted" class="btn btn-sm" style="display:none;"><i class="fas fa-check-double"></i> Completed</button>
                        </div>
                    </div>
                    <div class="topic-desc" id="topicDesc"></div>
                </div>
            </div>
        </div>
    </div>

    <script src="https://code.jquery.com/jquery-3.7.1.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <script>
        var CSRF_TOKEN = '{{ csrf_token() }}';
        var COURSE_ID = {{ $course->id }};
        var currentTopicId = null;
        var completedTopics = @json($completedTopics);

        $.ajaxSetup({headers:{'X-CSRF-TOKEN':CSRF_TOKEN}});

        // Global AJAX error handler
        $(document).ajaxError(function(event, xhr){
            if(xhr.statusHandled) return;
            var msg = 'An unexpected error occurred.';
            if(xhr.status === 419) msg = 'Session expired. Please refresh the page.';
            else if(xhr.status === 401) msg = 'Unauthorized. Please log in again.';
            else if(xhr.status === 403) msg = 'You do not have permission to perform this action.';
            else if(xhr.status >= 500) msg = 'Server error. Please try again later.';
            else if(xhr.status === 0) msg = 'Network error. Please check your connection.';
            else { try{ var r=JSON.parse(xhr.responseText); if(r.message) msg=r.message; }catch(e){} }
            Swal.fire('Error', msg, 'error');
        });

        function toggleModule(header){
            var mod = $(header).closest('.cv-module');
            mod.toggleClass('active');
            var icon = $(header).find('i');
            icon.toggleClass('fa-chevron-down fa-chevron-up');
        }

        function loadTopic(id, el){
            currentTopicId = id;
            $('.cv-topic-item').removeClass('active');
            $(el).addClass('active');

            var video = $(el).data('video') || '';
            var title = $(el).data('title');
            var desc = $(el).data('desc') || '';

            // Convert YouTube URL to embed
            if(video){
                var yt = video.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?#]+)/);
                if(yt) video = 'https://www.youtube.com/embed/' + yt[1];
            }

            $('#mainVideo').attr('src', video);
            $('#topicTitle').text(title);
            $('#topicDesc').html(desc.replace(/\n/g, '<br>'));
            $('#playerEmptyState').hide();
            $('#playerContainer').show();

            if(completedTopics.includes(id)){
                $('#btnMarkComplete').hide();
                $('#btnCompleted').show();
            } else {
                $('#btnMarkComplete').show();
                $('#btnCompleted').hide();
            }
        }

        function markTopicComplete(){
            $.post('{{ route("api.topics.complete") }}', {courseId: COURSE_ID, topicId: currentTopicId}, function(res){
                if(res.status === 200){
                    completedTopics.push(currentTopicId);
                    // Update icon in sidebar
                    $('.cv-topic-item[data-topic-id="'+currentTopicId+'"] i').removeClass('fa-play-circle').addClass('fa-check-circle text-success');
                    $('#btnMarkComplete').hide();
                    $('#btnCompleted').show();
                    // Update progress
                    if(res.progress !== undefined){
                        $('#cvProgressBar').css('width', res.progress+'%');
                        $('#cvProgressText').text(res.progress+'% Complete');
                    }
                    Swal.fire({icon:'success',title:'Completed!',toast:true,position:'top-end',showConfirmButton:false,timer:2000});
                } else {
                    Swal.fire('Error', res.message, 'error');
                }
            }, 'json');
        }

        $(document).ready(function(){
            // Auto-load first topic
            var first = $('.cv-topic-item').first();
            if(first.length) first.click();
        });
    </script>
</body>
</html>
