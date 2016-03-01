/*global Qiniu */
/*global plupload */
/*global FileProgress */
/*global hljs */


$(function() {
    var btn='upload-files',
        upUrl=$('#'+btn).attr('data-source'),
        imgUrl=$('#'+btn).attr('data-img-url'),target=$('#'+btn).attr('data-target'),swf=$('#'+btn).attr('data-swf');
    var uploader = Qiniu.uploader({
        runtimes: 'html5,flash,html4',
        browse_button: btn,
        container: 'container',
        drop_element: 'container',
        max_file_size: '500mb',
        flash_swf_url: swf,
        dragdrop: true,
        chunk_size: '4mb',
        uptoken_url: upUrl,
        domain: imgUrl,
        get_new_uptoken: false,
        // downtoken_url: '/downtoken',
         unique_names: true,
        // save_key: true,
        // x_vars: {
        //     'id': '1234',
        //     'time': function(up, file) {
        //         var time = (new Date()).getTime();
        //         // do something with 'time'
        //         return time;
        //     },
        // },
        auto_start: true,
        log_level: 5,
        init: {
            'FilesAdded': function(up, files) {
                $('#success').hide();
                plupload.each(files, function(file) {
                    var progress = new FileProgress(file, target);
                    progress.setStatus("等待...");
                    progress.bindUploadCancel(up);
                });
            },
            'BeforeUpload': function(up, file) {
                var progress = new FileProgress(file, target);
                var chunk_size = plupload.parseSize(this.getOption('chunk_size'));
                if (up.runtime === 'html5' && chunk_size) {
                    progress.setChunkProgess(chunk_size);
                }
            },
            'UploadProgress': function(up, file) {
                var progress = new FileProgress(file, target);
                var chunk_size = plupload.parseSize(this.getOption('chunk_size'));
                progress.setProgress(file.percent + "%", file.speed, chunk_size);
            },
            'UploadComplete': function() {
                $('#success').show();
            },
            'FileUploaded': function(up, file, info) {
                var progress = new FileProgress(file, target);
                progress.setComplete(up, info);
            },
            'Error': function(up, err, errTip) {
                var progress = new FileProgress(err.file,target);
                progress.setError();
                progress.setStatus(errTip);
            }
                // ,
                // 'Key': function(up, file) {
                //     var key = "";
                //     // do something with key
                //     return key
                // }
        }
    });
});
