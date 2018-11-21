import Cropper from "cropperjs";
import template from "./index.html"
export default {
  template,
  props: {
    file: {
      required: true
    },
    options: {
      type: Object,
      required: true,
      default: {}
    },
    confirmtext: {
      type: String,
      default: "确认"
    },
    canceltext: {
      type: String,
      default: "取消"
    }
  },
  data() {
    return {
      originUrl: "",
      show: false
    };
  },
  watch: {
    file(newValue) {
      this.show = true;
      this.$emit("loadimgstart");
      this.initilize();
      this.getObjectURL(newValue);
    }
  },
  methods: {
    // 初始化
    initilize() {
      let option = {
        aspectRatio: 16 / 9,
        autoCropArea: 0.8,
        viewMode: 1,
        guides: true,
        cropBoxResizable: true,
        cropBoxMovable: true,
        dragCrop: true,
        background: false,
        checkOrientation: true,
        checkCrossOrigin: true,
        zoomable: false,
        zoomOnWheel: false,
        center: true,
        toggleDragModeOnDblclick: false
      };
      let self = this;
      Object.keys(this.options).map(key => {
        option[key] = self.options[key];
      });

      option.ready = function() {
          console.log('cropper加载完成')
      };

      //初始化裁剪对象
      this.cropper = new Cropper(this.$refs.image, option);
    },

    // 把文件转成base64
    getObjectURL(file) {
      let self = this;
      let fr = new FileReader();
      fr.readAsDataURL(file);
      fr.onload = function() {
        if (self.options.compress) {
          let img = new Image();
          img.src = this.result;
          img.onload = function() {
            self.originUrl = self.compress(img);
            //每次替换图片要重新得到新的url
            if (self.cropper) {
              self.cropper.replace(self.originUrl);
            }
            self.$emit("loadimgend");
          };
        } else {
          self.originUrl = this.result;
          //每次替换图片要重新得到新的url
          if (self.cropper) {
            self.cropper.replace(self.originUrl);
          }
          self.$emit("loadimgend");
        }
      };
    },

    // 压缩图片
    compress(img, Orientation) {
      let canvas = document.createElement("canvas");
      let ctx = canvas.getContext("2d");
      //瓦片canvas
      let tCanvas = document.createElement("canvas");
      let tctx = tCanvas.getContext("2d");
      let initSize = img.src.length;
      let width = img.width;
      let height = img.height;

      //如果图片大于四百万像素，计算压缩比并将大小压至400万以下
      let ratio;
      if ((ratio = (width * height) / 4000000) > 1) {
        console.log("大于400万像素");
        ratio = Math.sqrt(ratio);
        width /= ratio;
        height /= ratio;
      } else {
        ratio = 1;
      }
      canvas.width = width;
      canvas.height = height;
      //        铺底色
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      //如果图片像素大于100万则使用瓦片绘制
      let count;
      if ((count = (width * height) / 1000000) > 1) {
        count = ~~(Math.sqrt(count) + 1); //计算要分成多少块瓦片
        //            计算每块瓦片的宽和高
        let nw = ~~(width / count);
        let nh = ~~(height / count);
        tCanvas.width = nw;
        tCanvas.height = nh;
        for (let i = 0; i < count; i++) {
          for (let j = 0; j < count; j++) {
            tctx.drawImage(
              img,
              i * nw * ratio,
              j * nh * ratio,
              nw * ratio,
              nh * ratio,
              0,
              0,
              nw,
              nh
            );
            ctx.drawImage(tCanvas, i * nw, j * nh, nw, nh);
          }
        }
      } else {
        ctx.drawImage(img, 0, 0, width, height);
      }
      //修复ios上传图片的时候 被旋转的问题
      if (Orientation != "" && Orientation != 1) {
        switch (Orientation) {
          case 6: //需要顺时针（向左）90度旋转
            this.rotateImg(img, "left", canvas);
            break;
          case 8: //需要逆时针（向右）90度旋转
            this.rotateImg(img, "right", canvas);
            break;
          case 3: //需要180度旋转
            this.rotateImg(img, "right", canvas); //转两次
            this.rotateImg(img, "right", canvas);
            break;
        }
      }
      //进行最小压缩
      let ndata = canvas.toDataURL("image/jpeg", 0.1);
      console.log("压缩前：" + initSize);
      console.log("压缩后：" + ndata.length);
      console.log(
        "压缩率：" + ~~((100 * (initSize - ndata.length)) / initSize) + "%"
      );
      tCanvas.width = tCanvas.height = canvas.width = canvas.height = 0;

      return ndata;
    },

    // 裁剪
    clip() {
      let self = this;
      let image = new Image();
      let croppedCanvas;
      let roundedCanvas;
      self.$emit("saveloadingstart");
      setTimeout(() => {
        croppedCanvas = self.cropper.getCroppedCanvas();
        // Round
        roundedCanvas = self.getRoundedCanvas(croppedCanvas);

        self.destoried();

        let imgData = roundedCanvas.toDataURL();
        image.src = imgData;

        self.postImg(imgData);
      }, 20);
    },

    getRoundedCanvas(sourceCanvas) {
      let canvas = document.createElement("canvas");
      let context = canvas.getContext("2d");
      let width = sourceCanvas.width;
      let height = sourceCanvas.height;

      canvas.width = width;
      canvas.height = height;

      context.imageSmoothingEnabled = true;
      context.drawImage(sourceCanvas, 0, 0, width, height);
      context.globalCompositeOperation = "destination-in";
      context.beginPath();
      context.rect(0, 0, width, height);
      context.fill();

      return canvas;
    },

    postImg(imageData) {
      this.$emit("upload", imageData);
    },

    destoried() {
      //销毁裁剪对象
      this.cropper.destroy();
      this.cropper = null;
      this.show = false;
      this.originUrl = null;
    },

    rotateImg(img, direction, canvas) {
      //最小与最大旋转方向，图片旋转4次后回到原方向
      const min_step = 0;
      const max_step = 3;
      if (img == null) return;
      //img的高度和宽度不能在img元素隐藏后获取，否则会出错
      let height = img.height;
      let width = img.width;
      let step = 2;
      if (step == null) {
        step = min_step;
      }
      if (direction == "right") {
        step++;
        //旋转到原位置，即超过最大值
        step > max_step && (step = min_step);
      } else {
        step--;
        step < min_step && (step = max_step);
      }
      //旋转角度以弧度值为参数
      let degree = (step * 90 * Math.PI) / 180;
      let ctx = canvas.getContext("2d");
      switch (step) {
        case 0:
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0);
          break;
        case 1:
          canvas.width = height;
          canvas.height = width;
          ctx.rotate(degree);
          ctx.drawImage(img, 0, -height);
          break;
        case 2:
          canvas.width = width;
          canvas.height = height;
          ctx.rotate(degree);
          ctx.drawImage(img, -width, -height);
          break;
        case 3:
          canvas.width = height;
          canvas.height = width;
          ctx.rotate(degree);
          ctx.drawImage(img, -width, 0);
          break;
      }
    },

    cancelClip() {
      this.destoried();
      this.$emit('cancelfun')
    }
  }
};