// let urlData = decodeURI(window.location.href);
let urlData = 'http://192.168.70.225:7002/?requestKey=D21111000000&token=bearer eec5660e-627e-4fd8-82ab-76a456a52b83'
let cs = urlData.split('?')[1];
if (!cs) {
    window.location.href = '/errorPage';
}
let csArr = cs.split('&');
for (let i = 0; i < csArr.length; i++) { //遍历数组，拿到json对象
    csArr[csArr[i].split('=')[0]] = csArr[i].split('=')[1]
}
if (csArr.token) sessionStorage.setItem('token', csArr.token);
if (csArr.requestKey) sessionStorage.setItem('projectId', csArr.requestKey.slice(0, 12));
// 获取基础参数及页面权限

$.ajax({
    method: "get",
    url: urls.editUrl + "/questForParameters?requestKey=" + csArr.requestKey,
    dataType: "json",
    headers: {
        'authorization': sessionStorage.getItem('token') || '',
        'projectId': sessionStorage.getItem('projectId') || ''
    },
    contentType: "application/json;charset=utf-8",
    success: function (data) {
        if (data.success && data.data.length > 0) {
            switch (data.data[0].NowLink) {
                case 'T':
                    window.location.href = '/Index';
                    break;
                case 'C':
                    window.location.href = '/ReviserIndex';
                    break;
                case 'Q':
                    window.location.href = '/QAIndex';
                    break;
                case 'P':
                    window.location.href = '/PMIndex';
                    break;
                case 'ES':
                    // typemethod = 'SubmitES';
                    break;
            }
            data.data = data.data || [];
            sessionStorage.setItem('dataListCAT', JSON.stringify(data.data));
        } else {
            // window.location.href = '/errorPage';
        }
    }
});
// 用作本地调试时的参数
let catData = [{ "SysFrom": "pm", "UserID": "S00182", "UserName": "苏红利", "Projectid": "D21111000000", "PageLink": "EditIndex", "Fileid": "4048566", "Packid": ["b4568ba9-8b14-435e-8a60-aa8306e4eade"], "NowLink": "P", "ProjectCreatedTime": "2021-11-10 09:12:44" }];

//D21111000000
//D21053100700
sessionStorage.setItem('dataListCAT', JSON.stringify(catData));