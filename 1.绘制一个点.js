// 顶点着色器程序
var vertexShaderSource =
    'void main() {\n' +
    ' gl_Position = vec4(0.0, 0.0, 0.0, 1.0);\n' + // 设置坐标
    ' gl_PointSize = 10.0;\n' + // 设置尺寸
    '}\n';
// 片元着色器程序
var fragmentShaderSource =
    'void main() {\n' +
    ' gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n' + //设置颜色
    '}\n';


var gl;
function main() {
    // 获取<canvas>元素
    var canvas = document.getElementById('webgl');

    //获取WebGL绘图上下文
    gl = canvas.getContext("webgl2", {
        antialias: false,
    });
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    // 初始化着色器
    if (!initShaders()) {
        console.log('Failed to initialize shaders.');
        return;
    }
    // 设置<canvas>的背景色
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    // 清空<canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);
    // 绘制一个点
    gl.drawArrays(gl.POINTS, 0, 1)
}









function initShaders() {
    // 创建顶点着色器对象
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    // 指定着色器对象的代码
    gl.shaderSource(vertexShader, vertexShaderSource);
    // 编译着色器
    gl.compileShader(vertexShader);
    // 通过getShaderParameter()检查着色器的状态 gl.COMPILE_STATUS:指定待获取参数的类型
    // 如果编译失败会返回false
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
      // gl.getShaderInfoLog(shader): 获取着色器编译错误信息
      console.error(gl.getShaderInfoLog(vertexShader));
    }
    // 创建片元着色器
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    // 指定片元着色器对象的代码
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(fragmentShader));
    }
    // 创建程序对象：包含了顶点着色器和片元着色器
    const program = gl.createProgram();
    // 为程序对象分配着色器对象：顶点着色器、片元着色器
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    // 连接程序对象：将顶点着色器和片元着色器连接起来
    gl.linkProgram(program);
    // 告知WebGL系统所使用的程序对象：该函数允许WebGL在绘制前准备多个程序对象
    // 然后在绘制的时候根据需要切换程序对象
    gl.useProgram(program);  
    return true;

}