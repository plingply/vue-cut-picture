# vue-cut-picture

[github仓库-求关注-求点心](https://github.com/plingply/vue-cut-picture.git)

### 预览效果
暂无

自定义裁剪框的大小，支持移动PC

### 使用方法：
```javascript

//安装
npm install vue-cut-picture --save
//在项目中引入
import 'vue-cut-picture/dist/style.css';
import vueCutPicture from "vue-cut-picture";
Vue.use(vueCutPicture)

//在项目中使用
<vue-cut-picture :url="url" v-show="cutimgshow" :height="height" :width="width" :cutwidth="cutwidth" @uploadfile="uploadfile"></vue-cut-picture>

```

### props:
 ```javascript
  props: {
    height: {
      type: String,
      default: "200px"
    },
    width: {
      type: String,
      default: "100%"
    },
    cutwidth: {
      type: String,
      default: "200px"
    },
    cutheight: {
      type: String,
      default: "100px"
    },
    url: {
      required: true
    },
    cancelShow:{
        type: Boolean,
        default:true
    },
    cancelText:{
        type: String,
        default:'确认裁剪'
    },
    confirmShow:{
        type: Boolean,
        default:true
    },
    confirmText:{
        type: String,
        default:'取消'
    }
  }
 ```

### methods
 ```javascript
    // 确认回调
   @uploadfile
   // 取消回调
   @cancelfun
   
	 裁剪后的回调，包含文件和图片地址
 ```