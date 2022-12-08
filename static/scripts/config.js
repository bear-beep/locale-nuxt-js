let urls = {}
// sessionStorage.setItem('editor_ENV',getCookie('editor_ENV'));
sessionStorage.setItem('editor_ENV','test');
switch (sessionStorage.getItem('editor_ENV')){
    // 开发环境
    case 'dev':
        urls = {
            tmtbUrl: "http://192.168.4.193:8507/corpora",
            qaUrl: "http://192.168.4.193:8507/qa",
            qaUrlES: 'http://209.lan-bridge.cn:8087', // 作业QA地址(老版？)
            editUrl: "http://192.168.4.193:8507/editor", // 编辑器
            preLibUrl: "http://192.168.4.193:8507",  // 预翻过库
            mtUrl: 'http://192.168.4.193:8507',
            mtYYQUrl: 'http://192.168.2.226:5002',
            confirmMtYYQUrl: 'http://209.lan-bridge.cn:8012',
            chatRoomId: 'http://192.168.4.190:5791',
            chatRoom: 'http://192.168.4.195:9966',
            chatWS: 'wss://crmtest.lan-bridge.cn:8096',
            login: 'http://192.168.4.193:3002'
        }
        break;
    // 测试环境
    case 'test':
        urls = {
            tmtbUrl: "https://lancattest.lan-bridge.cn:8507/corpora",
            qaUrl: "https://lancattest.lan-bridge.cn:8507/qa",
            qaUrlES: 'http://209.lan-bridge.cn:8087', // 作业QA地址(老版？)
            editUrl: "https://lancattest.lan-bridge.cn:8507/editor", // 编辑器
            preLibUrl: "https://lancattest.lan-bridge.cn:8507",  // 预翻过库
            mtUrl: 'https://lancattest.lan-bridge.cn:8507',
            confirmMtYYQUrl: 'https://ecadmintest.lan-bridge.cn:33003/cat8012', // 转：http://192.168.2.226:5001
            chatRoomId: 'https://crmtest.lan-bridge.cn:5791',
            chatRoom: 'https://ecadmintest.lan-bridge.cn:39966',
            chatWS: 'wss://crmtest.lan-bridge.cn:8096',
            login: 'https://ecadmintest.lan-bridge.cn:33002'
        }
        break;
    // 集成环境
    case 'preprod':
        urls = {
            tmtbUrl: "https://lancatpangu_pre.lan-bridge.com/corpora",
            qaUrl: "https://lancatpangu_pre.lan-bridge.com/qa",
            qaUrlES: "http://209.lan-bridge.cn:8087",
            editUrl: "https://lancatpangu_pre.lan-bridge.com/editor",
            preLibUrl: "https://lancatpangu_pre.lan-bridge.com",  // 预翻过库
            mtUrl: 'https://lancatpangu_pre.lan-bridge.com',
            confirmMtYYQUrl: 'https://ecadmintest.lan-bridge.cn:33003/cat8012', // 转：http://192.168.2.226:5001
            chatRoomId: 'https://pangu1_pre.lan-bridge.com/pg',
            chatRoom: 'http://47.108.173.23:9966',
            chatWS: 'ws://47.108.173.23:8096',
            login: 'https://adminpai_pre.51yuyan.com'
        }
        break;
    // 正式环境
    default:
        urls = {
            tmtbUrl: "https://collegeCatTest.lan-bridge.cn:7003/corpora",
            qaUrl: "https://lancatpangu.lan-bridge.cn:7003/qa",
            qaUrlES: "https://lancatpangu.lan-bridge.cn:7003/qa",
            editUrl: "https://catcorpus.lan-bridge.cn:7003/editor",
            preLibUrl: "https://lancatpangu.lan-bridge.cn:7003",  // 预翻过库
            mtUrl: 'https://lancatpangu.lan-bridge.cn:7003',
            confirmMtYYQUrl: 'https://editor.lan-bridge.cn/cat5001', // 转：'http://192.168.2.226:5001'
            chatRoomId: 'https://pangu1.lan-bridge.cn:5791',
            chatRoom: 'https://chat.lan-bridge.cn',
            chatWS: 'wss://chat1.lan-bridge.cn:8096',
            login: 'https://w3.lan-bridge.cn'  // 登录页
        }
}
// 获取cookie里的环境变量值
function getCookie(cookieName) {
    const strCookie = document.cookie;
    const cookieList = strCookie.split(';');
    for(let i = 0; i < cookieList.length; i++) {
        const arr = cookieList[i].split('=');
        if (arr[0] && cookieName === arr[0].trim()) {
            return arr[1];
        }
    }
    return '';
}
