/*global plupload */
/*global qiniu */
function FileProgress(file, targetID) {
    this.fileProgressID = file.id;
    this.file = file;
    this.opacity = 100;
    this.height = 0;
    this.fileProgressWrapper = $('#' + this.fileProgressID);
    this.target = $('#' + targetID);
    this.beforeTemp=this.target.attr('data-up-before');
    this.aftereTemp=this.target.attr('data-up-after');
    if (!this.fileProgressWrapper.length) {
        var data = {fileName: file.name, id: file.id, fileSize: plupload.formatSize(file.size).toUpperCase()};
        var html = template(this.beforeTemp, data);
        this.target.append(html);
    } else {
        this.reset();
    }
    this.setTimer(null);
}

FileProgress.prototype.setTimer = function (timer) {
    this.fileProgressWrapper.FP_TIMER = timer;
};

FileProgress.prototype.getTimer = function (timer) {
    return this.fileProgressWrapper.FP_TIMER || null;
};

FileProgress.prototype.reset = function () {
    this.appear();
};

FileProgress.prototype.setChunkProgess = function (chunk_size) {
    var chunk_amount = Math.ceil(this.file.size / chunk_size);
    if (chunk_amount === 1) {
        return false;
    }
};

FileProgress.prototype.setProgress = function (percentage, speed, chunk_size) {
    var file = this.file;
    var uploaded = file.loaded;

    var size = plupload.formatSize(uploaded).toUpperCase();
    var formatSpeed = plupload.formatSize(speed).toUpperCase();
    if (this.fileProgressWrapper.find('.status').text() === '取消上传') {
        return;
    }
    this.fileProgressWrapper.find('.status').text("已上传: " + size + " 上传速度： " + formatSpeed + "/s");
    percentage = parseInt(percentage, 10);
    if (file.status !== plupload.DONE && percentage === 100) {
        percentage = 99;
    }
    this.appear();
};

FileProgress.prototype.setComplete = function (up, info) {
    var data=$.parseJSON(info);
    var isImage = function (url) {
        var res, suffix = "";
        var imageSuffixes = ["png", "jpg", "jpeg", "gif", "bmp"];
        var suffixMatch = /\.([a-zA-Z0-9]+)(\?|\@|$)/;

        if (!url || !suffixMatch.test(url)) {
            return false;
        }
        res = suffixMatch.exec(url);
        suffix = res[1].toLowerCase();
        for (var i = 0, l = imageSuffixes.length; i < l; i++) {
            if (suffix === imageSuffixes[i]) {
                return true;
            }
        }
        return false;
    };
    data['isImage']=isImage(data['key']);
    var html=template(this.aftereTemp,data);
    this.fileProgressWrapper.html(html);
};
FileProgress.prototype.setError = function () {
};

FileProgress.prototype.setCancelled = function (manual) {
    var progressContainer = 'progressContainer';
    if (!manual) {
        progressContainer += ' red';
    }
};

FileProgress.prototype.setStatus = function (status, isUploading) {
    if (!isUploading) {
        this.fileProgressWrapper.find('.status').text(status).attr('class', 'status text-left');
    }
};

// 绑定取消上传事件
FileProgress.prototype.bindUploadCancel = function (up) {
    var self = this;
    if (up) {
        self.fileProgressWrapper.find('td:eq(2) .progressCancel').on('click', function () {
            self.setCancelled(false);
            self.setStatus("取消上传");
            self.fileProgressWrapper.find('.status').css('left', '0');
            up.removeFile(self.file);
        });
    }

};

FileProgress.prototype.appear = function () {
    if (this.getTimer() !== null) {
        clearTimeout(this.getTimer());
        this.setTimer(null);
    }
    this.fileProgressWrapper.show();
};
