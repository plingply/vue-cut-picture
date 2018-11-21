# vue-cut-picture

[github仓库-求关注-求点心](https://github.com/plingply/vue-cut-picture.git)

参数为 cropperjs 参数相同

<input type="file" ref="file" @change="change">

引入
import cut from "vue-cut-picture"
import "vue-cut-picture/dist/style.css"

组件中使用

<cut :options="{}" :file="file" @upload="uploadFun" @saveloadingstart="saveloadingstart" @loadimgstart="loadimgstart" @loadimgend="loadimgend" @cancelfun="cancelfun"></cut>

file 图片文件
options cropperjs配置
upload //裁剪完成后回调 base64 可自行上传至服务器
saveloadingstart // 保存图片，可自行加loading
loadimgstart // 加载图片开始，可自行加loading
loadimgstart // 加载图片结束，可自行加loading
cancelfun // 取消按钮回调

changes(e){
  // 当文件改变 就可以出发裁剪功能
  this.file = e.target.files[0];
}

