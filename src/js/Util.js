/**
 * 工具函数模块
 * 提供 HTTP 请求、视频格式检测、时间格式转换等通用功能
 */

const axios = require('axios');
const qs = require('qs');

/**
 * 配置 axios 默认请求转换器
 * 将对象类型的数据自动转换为 URL 查询字符串格式
 */
axios.defaults.transformRequest = function(data){
    if(typeof(data)!='object')return data;
    return qs.stringify(data);
}

/**
 * HTTP GET 请求封装
 * @param {string} url - 请求地址
 * @param {object} data - 查询参数对象
 * @param {function} success - 成功回调函数,参数为 axios response 对象
 * @param {function} error - 失败回调函数,参数为 error 对象
 */
exports.httpGet = function(url,data,success,error){
    axios.get(url,{param:data}).then(r=>{
        if(typeof(success)!='undefined')success(r);
    }).catch(e=>{
        if(typeof(error)!='undefined')error(e);
    });
}

/**
 * HTTP POST 请求封装
 * @param {string} url - 请求地址
 * @param {object} data - POST 数据对象
 * @param {function} success - 成功回调函数,参数为 axios response 对象
 * @param {function} error - 失败回调函数,参数为 error 对象
 */
exports.httpPost = function(url,data,success,error){
    axios.post(url,data).then(r=>{
        if(typeof(success)!='undefined')success(r);
    }).catch(e=>{
        if(typeof(error)!='undefined')error(e);
    });
}
// 支持的视频格式类型定义
const hlsTypes = ['application/vnd.apple.mpegurl']; // HLS 流媒体格式 (HTTP Live Streaming)
const defaultTypes = ['video/mp4','video/webm','video/ogg']; // HTML5 原生支持的视频格式

/**
 * 检测是否为 HLS 视频格式
 * @param {string} type - MIME 类型字符串
 * @returns {boolean} 是否为 HLS 格式
 */
exports.isHlsVideo = function(type){
    for(let i in hlsTypes){
        if(hlsTypes[i]==type)return true;
    }
    return false;
}

/**
 * 检测是否为浏览器原生支持的视频格式
 * @param {string} type - MIME 类型字符串
 * @returns {boolean} 是否为 HTML5 原生支持的格式 (mp4/webm/ogg)
 */
exports.isDefaultVideo = function(type){
    for(let i in defaultTypes){
        if(defaultTypes[i]==type)return true;
    }
    return false;
}

/**
 * 检测是否为默认视频格式 (重复函数,与 isHlsVideo 逻辑相同)
 * @deprecated 此函数与 isHlsVideo 功能重复,建议使用 isHlsVideo
 * @param {string} type - MIME 类型字符串
 * @returns {boolean} 是否为 HLS 格式
 */
exports.isDefVideo = function(type){
    for(let i in hlsTypes){
        if(hlsTypes[i]==type)return true;
    }
    return false;
}
/**
 * 将秒数转换为时间格式字符串 (mm:ss)
 * @param {number} time - 秒数
 * @returns {string} 格式化后的时间字符串,格式为 "mm:ss"
 * @example
 * parseToTime(65)   // 返回 "01:05"
 * parseToTime(5)    // 返回 "00:05"
 * parseToTime(125)  // 返回 "02:05"
 */
exports.parseToTime = function(time){
    if(isNaN(time))return "00:00";
    time = Math.floor(time);

    // 小于 60 秒的情况
    if(60>time){
        if(10>time){
            return `00:0${time}`;
        }else{
            return `00:${time}`;
        }
    }else{
        // 大于等于 60 秒,计算分钟和秒
        let m = Math.floor(time/60);
        let s = time-(m*60);
        // 秒数补零
        if(10>s)s = "0"+s;
        // 分钟数补零
        if(10>m)m = "0"+m;
        return `${m}:${s}`;
    }
}

/**
 * 将时间格式字符串转换为秒数
 * @param {string} time - 时间字符串,支持 "mm:ss" 或纯秒数
 * @returns {number} 总秒数
 * @example
 * parseToS("01:05")  // 返回 65
 * parseToS("30")     // 返回 30
 */
exports.parseToS = function(time){
    let timeArr = time.split(":");
    let m =0,s=0;
    if(timeArr.length==2){
        // "mm:ss" 格式
        m = parseInt(timeArr[0]);
        s = parseInt(timeArr[1]);
    }else{
        // 纯秒数格式
        m = 0;
        s = parseInt(time);
    }
    return (m*60)+s;
}
/**
 * 将秒数转换为人类可读的时间字符串
 * 支持天、时、分、秒的自动转换和组合显示
 * @param {number} s - 总秒数
 * @returns {string} 格式化后的时间字符串,例如 "1天2时30分45秒"
 * @example
 * calcTime(45)        // 返回 "45秒"
 * calcTime(125)       // 返回 "2分5秒"
 * calcTime(3665)      // 返回 "1时1分5秒"
 * calcTime(90061)     // 返回 "1天1时1分1秒"
 */
exports.calcTime = (s) => {
    if (!s) {
        return '-'
    }
    const dateTime = 24 * 60 * 60   // 一天的秒数
    const hourTime = 60 * 60        // 一小时的秒数
    const minuteTime = 60           // 一分钟的秒数

    // 计算天数
    const d = Number(parseInt(s / 60 / 60 / 24 + '')) || 0
    if (d > 0) {
        s = s - d * dateTime
    }

    // 计算小时数
    const h = Number(parseInt(s / 60 / 60 + '')) || 0
    if (h > 0) {
        s = s - h * hourTime
    }

    // 计算分钟数
    const m = Number(parseInt(s / 60 + '')) || 0
    if (m > 0) {
        s = s - m * minuteTime // 剩余的就是秒数
    }

    // 构建时间字符串数组,过滤掉值为 0 的单位
    let str = [
        { k: d, v: d ? `${d}天` : '' },
        { k: h, v: h ? `${h}时` : '' },
        { k: m, v: m ? `${m}分` : '' },
        { k: s, v: s ? `${s}秒` : '' },
    ].filter(item => item.v)

    // 提取有效的时间单位字符串
    str = str.map(item => item.v)

    return str.join('')
}