import template from "./index.html"

let vueCutPicture = {
    template,
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
        cancelShow: {
            type: Boolean,
            default: true
        },
        cancelText: {
            type: String,
            default: '确认裁剪'
        },
        confirmShow: {
            type: Boolean,
            default: true
        },
        compress: {
            type: Boolean,
            default: false
        },
        confirmText: {
            type: String,
            default: '取消'
        }
    },
    data() {
        return {
            isClick: false, // 控制裁剪框移动
            isclick1: false, //控制裁剪框大小

            point_className: "",
            oldx: 0,
            oldy: 0,
            imgurl: "",
            // 裁剪框 宽高比例
            shx: 1,

            loading: false
        };
    },
    watch: {
        url(file) {
            this.loading = true
            var self = this;
            var carbox = this.$refs.cut_carbox;
            var width = carbox.clientWidth;
            var fr = new FileReader();
            fr.readAsDataURL(file);
            fr.onload = function () {
                if (self.compress) {
                    let img = new Image()
                    img.src = this.result
                    img.onload = function () {
                        self.imgurl = self.compressImg(img)
                        self.$refs.caijianimg.style.maxWidth = self.width;
                        self.$refs.caijianimg.style.minWidth = width + "px";
                        self.$refs.caijianimg.style.maxHeight = self.height;

                        setTimeout(() => {
                            self.setCatboxposition();
                        });
                    }
                } else {
                    self.imgurl = this.result;
                    self.$refs.caijianimg.style.maxWidth = self.width;
                    self.$refs.caijianimg.style.minWidth = width + "px";
                    self.$refs.caijianimg.style.maxHeight = self.height;

                    setTimeout(() => {
                        self.setCatboxposition();
                    });
                }

            };
        }
    },
    methods: {
        //压缩图片
        compressImg(img) {
            let canvas = document.createElement("canvas");
            let ctx = canvas.getContext('2d');
            //瓦片canvas
            let tCanvas = document.createElement("canvas");
            let tctx = tCanvas.getContext("2d");
            let width = img.width;
            let height = img.height;

            //如果图片大于四百万像素，计算压缩比并将大小压至400万以下
            let ratio;
            if ((ratio = width * height / 4000000) > 1) {
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
            if ((count = width * height / 1000000) > 1) {
                count = ~~(Math.sqrt(count) + 1); //计算要分成多少块瓦片
                //            计算每块瓦片的宽和高
                let nw = ~~(width / count);
                let nh = ~~(height / count);
                tCanvas.width = nw;
                tCanvas.height = nh;
                for (let i = 0; i < count; i++) {
                    for (let j = 0; j < count; j++) {
                        tctx.drawImage(img, i * nw * ratio, j * nh * ratio, nw * ratio, nh * ratio, 0, 0, nw, nh);
                        ctx.drawImage(tCanvas, i * nw, j * nh, nw, nh);
                    }
                }
            } else {
                ctx.drawImage(img, 0, 0, width, height);
            }
            //进行最小压缩
            let ndata = canvas.toDataURL('image/jpeg', 0.3);
            tCanvas.width = tCanvas.height = canvas.width = canvas.height = 0;
            return ndata;
        },
        // 设置box尺寸
        setBoxsize() {
            var box = this.$refs.cut_imgbox;
            box.style.width = this.width;
            box.style.height = this.height;
        },
        //设置剪裁框的位置 以及遮罩层大小定位
        setCatboxposition() {
            var box = this.$refs.cut_box;
            var carbox = this.$refs.cut_carbox;
            var bh = box.clientHeight;
            var bw = box.clientWidth;

            carbox.style.width = this.cutwidth;
            carbox.style.height = this.cutheight;

            var ch = carbox.clientHeight;
            var cw = carbox.clientWidth;
            var left = (bw - cw) / 2 < 0 ? 0 : (bw - cw) / 2;
            var top = (bh - ch) / 2 < 0 ? 0 : (bh - ch) / 2;
            carbox.style.top = top + "px";
            carbox.style.left = left + "px";

            //设置遮罩层的大小
            var model = document.querySelectorAll(".cut_model");
            model.forEach(function (item) {
                item.style.height = bh + "px";
                if (item.className.indexOf("cut_model1") != -1) {
                    item.style.width = bw + "px";
                    item.style.height = bh * 3 + "px";
                    item.style.left = -1 * bw + "px";
                    item.style.top = (-1 * (bh * 3 - ch)) / 2 + "px";
                }
                if (item.className.indexOf("cut_model2") != -1) {
                    item.style.width = "100%";
                    item.style.left = "0px";
                    item.style.top = -1 * bh + "px";
                }
                if (item.className.indexOf("cut_model3") != -1) {
                    item.style.width = bw + "px";
                    item.style.height = bh * 3 + "px";
                    item.style.left = "100%";
                    item.style.top = (-1 * (bh * 3 - ch)) / 2 + "px";
                }
                if (item.className.indexOf("cut_model4") != -1) {
                    item.style.left = "0";
                    item.style.width = "100%";
                    item.style.top = "100%";
                }
            });

            carbox.style.opacity = 1;

            this.loading = false
        },

        // 剪裁框移动
        carboxdown(e) {
            e.preventDefault();
            this.point_className = e.target.className;
            // 移动裁剪框
            if (e.target.className == "cut_catbox") {
                this.isClick = true;
                this.oldx = e.clientX ? e.clientX : e.touches[0].clientX;
                this.oldy = e.clientY ? e.clientY : e.touches[0].clientY;
            }
            if (e.target.className.indexOf("cut_point") != -1) {
                this.oldx = e.clientX ? e.clientX : e.touches[0].clientX;
                this.oldy = e.clientY ? e.clientY : e.touches[0].clientY;
                this.isclick1 = true;
            }
        },

        carboxup() {
            this.isClick = false;
            this.isclick1 = false;
        },
        carboxmove(e) {
            // 裁剪框移动
            var box = this.$refs.cut_box;
            var carbox = this.$refs.cut_carbox;
            var bh = box.clientHeight;
            var bw = box.clientWidth;
            var ch = carbox.clientHeight;
            var cw = carbox.clientWidth;
            var x = e.clientX ? e.clientX : e.touches[0].clientX;
            var y = e.clientY ? e.clientY : e.touches[0].clientY;
            var cwx = this.oldx - x;
            var cwy = this.oldy - y;
            if (Math.abs(cwx) < 4 && Math.abs(cwy) < 4) {
                return
            }
            if (this.isClick) {
                var left = x - this.oldx;
                var top = y - this.oldy;
                var oldleft = parseFloat(carbox.style.left);
                var oldtop = parseFloat(carbox.style.top);

                if (
                    (oldleft + left >= 0 && oldleft + left < bw - cw) ||
                    (oldleft + left < oldleft && oldleft + left >= 0)
                ) {
                    carbox.style.left = oldleft + left + "px";
                    this.oldx = x;
                }

                if (
                    (oldtop + top >= 0 && oldtop + top < bh - ch) ||
                    (oldtop + top >= 0 && oldtop + top < oldtop)
                ) {
                    carbox.style.top = oldtop + top + "px";
                    this.oldy = y;
                }
            }
            //裁剪框改变大小
            if (this.isclick1) {
                var width = carbox.clientWidth;
                var left = parseFloat(carbox.style.left);
                var top = parseFloat(carbox.style.top);

                // 左上
                if (this.point_className.indexOf("cut_point1") != -1) {
                    let xwidth = width + cwx;
                    if (
                        ((xwidth > bw || xwidth / this.shx > bh) && xwidth > width) ||
                        (xwidth < 50 && xwidth < width)
                    ) {
                        return;
                    }
                    carbox.style.width = xwidth + "px";
                    carbox.style.height = xwidth / this.shx + "px";
                    carbox.style.left = left - cwx + "px";
                    carbox.style.top = top - cwx / this.shx + "px";
                    this.oldx = x;
                    this.oldy = y;
                }
                // 右上
                if (this.point_className.indexOf("cut_point3") != -1) {
                    let xwidth = width - cwx;
                    if (
                        ((xwidth > bw || xwidth / this.shx > bh) && xwidth > width) ||
                        (xwidth < 50 && xwidth < width)
                    ) {
                        return;
                    }
                    carbox.style.width = xwidth + "px";
                    carbox.style.height = xwidth / this.shx + "px";
                    carbox.style.top = top + cwx / this.shx + "px";
                    this.oldx = x;
                }
                // 右下
                if (this.point_className.indexOf("cut_point5") != -1) {
                    let xwidth = width - cwx;
                    if (
                        ((xwidth > bw || xwidth / this.shx > bh) && xwidth > width) ||
                        (xwidth < 50 && xwidth < width)
                    ) {
                        return;
                    }
                    carbox.style.width = width - cwx + "px";
                    carbox.style.height = xwidth / this.shx + "px";
                    this.oldx = x;
                }

                // 左下
                if (this.point_className.indexOf("cut_point7") != -1) {
                    let xwidth = width + cwx;
                    if (
                        ((xwidth > bw || xwidth / this.shx > bh) && xwidth > width) ||
                        (xwidth < 50 && xwidth < width)
                    ) {
                        return;
                    }
                    carbox.style.width = xwidth + "px";
                    carbox.style.height = xwidth / this.shx + "px";
                    carbox.style.left = left - cwx + "px";
                    this.oldx = x;
                }
            }
        },

        // 裁剪图片
        catImg(width, height, x, y) {
            let canvas = document.createElement("canvas");
            canvas.id = "cut_canvas";
            canvas.width = width;
            canvas.height = height;
            canvas.style.width = this.cutwidth;
            canvas.style.height = this.cutheight;
            this.$refs.yulanimg.innerHTML = "";
            this.$refs.yulanimg.appendChild(canvas);
            var cxt = canvas.getContext("2d");
            //创建新的图片对象
            var img = this.$refs.caijianimg;
            cxt.drawImage(img, -1 * x, -1 * y, img.width * 2, img.height * 2);

            this.upload();
        },

        // 裁剪
        confirmfun() {
            if (this.imgurl == "") {
                alert('请选择图片')
                return;
            }
            var carbox = this.$refs.cut_carbox;
            var width = carbox.clientWidth * 2;
            var height = carbox.clientHeight * 2;
            var x = parseFloat(carbox.style.left) * 2;
            var y = parseFloat(carbox.style.top) * 2;
            this.catImg(width, height, x, y);
        },

        // 取消按钮
        cancelfun() {
            this.$emit("cancelfun")
            this.$refs.yulanimg.innerHTML = "";
            this.imgurl = ""
        },

        upload() {
            var img = document.getElementById("caijianimg");
            var canvas = document.getElementById("cut_canvas");

            if (!canvas) {
                alert("请先裁剪图片")
                return;
            }

            var str = img.src.substr(img.src.lastIndexOf("."));
            //cavas 保存图片到本地  js 实现
            //------------------------------------------------------------------------
            //1.确定图片的类型  获取到的图片格式 data:image/Png;base64,......
            var type = str.substr(1); //你想要什么图片格式 就选什么吧
            var imgdata = canvas.toDataURL(type);

            this.$emit("uploadfile", {
                base64: imgdata
            });

            imgdata = null
            this.$refs.yulanimg.innerHTML = "";
            this.imgurl = ""
        }
    },
    mounted() {
        this.setBoxsize();
        let self = this;
        this.shx = parseInt(this.cutwidth) / parseInt(this.cutheight);
        window.addEventListener("mouseup", function () {
            self.isClick = false;
            self.isclick1 = false;
        });
    }
}

vueCutPicture.install = function (Vue, name = 'vueCutPicture') {
    Vue.component(name, vueCutPicture);
}

export default vueCutPicture;