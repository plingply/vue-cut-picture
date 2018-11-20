# vue-cut-picture

[github仓库-求关注-求点心](https://github.com/plingply/vue-cut-picture.git)

参数为 cropperjs 参数相同

<input type="file" @change="changes">

changes(event){
  this.clip(event, {
    aspectRatio: 760 / 400,// 裁剪框比例
    element: document.getElementById("fmloading"),// 插入元素，不传插入到body中
    upload: self.uploadfilefunc,// 上传回调 参数为base64图片
    loadingfunc: self.loadingfunc,// loading函数
    cancelfun: self.cancelfun // 取消回调
  });
}

