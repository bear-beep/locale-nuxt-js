/*
 * 设置基本参数、全局参数等
 * 比如数据本地存储、项目信息、keyCode、图标等。
*/
//全局变量，存储临时数据
var localData = {},//初始数据
    localParam = {
        allPageNum: 0,
        pageSize: 200,
        pageNum: 1,
        searchOringin: "",
        searchTrans: "",
        getContentMethod:1,//分页加载数据方式(1：初始加载，2：筛选，3：查找，4:替换前的查找)
        isGetContent:true,//是否获取内容
        isFirst:true,//是否第一次加载
        currentTarget:null,//当前可编辑译文焦点
        qaPageSize:Number(localStorage.getItem('qaPageSize')) || 500,//qa分页每页条数
    },
//全局变量，存储参数数据
    dataConfig = {
        reverseIds: [],//反选库ID
        originalEdit: true,//原文是否可以编辑
        TermProtection: "",//术语保护
        userName: "",
        userID: "",
        NowLink: "",
        dataList: [], // 项目、用户、文件、包ID
        percentge: 0,  //匹配率
        number: 20,  //最大匹配条数
        MTtype: null,
        ImportID_TB: null,
        ImportID_TM: null,
        DataBaseId_TB: [],
        DataBaseId_TM: [],
        createdTime: "",
        Field: "",
        FileID: "",
        ProjectID: "",
        PackID: [],  //包ID
        LangTypePair: "",
        sourceLan: "", //源语言
        targetLan: "",  //目标语言
        isShowTipOperation: true,
        isDTPevaluate: false, // 是否可以评价DTP
        userNameDTP: null, // dtp人员姓名
        userIdDTP: null, // dtp人员ID
        tokenPM: '', // PM传过来的token带入到聊天室
        msgNum: 0, // 未读的聊天信息
        chatRoomId: '', // 聊天室ID
        isfreelancer: false, // 译员是否为兼职
        isMTshow: true, // 用来判断译员是否可以使用机翻
        isDeleteRemark: true, // 用来判断是否可以删除其他角色备注
        newRangy:null, //存放格式化函数
        restrictions:0,//存节流时间戳
        allSubmitTime:0 ,//全部提交后刷新页面等待时间
        qaParams:{} ,//qa忽略后请求数据用参数
        currentTab:1, //右边tab当前激活位置
        currentTabEle:null, //点击译文后切换右边tab用
        sentence:{ele:{},ori:{},tar:{}}, //用于判断句段是否取改变
        currentSentence:[], //用于提交句段长时间未完成
    },
//全局变量，键盘keycode
    _keyCode = {
        '_b': 66, '_c': 67, '_d': 68, '_i': 73, '_u': 85, '_s': 83, '_a': 65, '_j': 74, '_p': 80, '_e': 69, '_r': 82, '_t': 84, '_g': 71, '_q': 81,
        '_enter': 13, '_home': 36, '_tab': 9, '_up': 38, '_down': 40, '_left': 37, '_right': 39, '_insert': 45, '_delete': 46, '_-': 189, '_=': 187,
        '_1': 49, '_2': 50, '_3': 51, '_4': 52, '_5': 53, '_6': 54, '_7': 55, '_8': 56, '_9': 57,
        '_f4': 115, '_f3': 114,'_f2': 113,'_f1':112
    },
//全局变量，图标icon
    icons = {
        yy: '<img src="/public/svg/yy.png" />',
        yy_no: '<img src="/public/svg/yy_no.png" />',
        sh: '<img src="/public/svg/check.png" />',
        sh_no: '<img src="/public/svg/check_no.png" />',
        qa: '<img src="/public/svg/qa.png" />',
        qa_no: '<img src="/public/svg/qa_no.png" />',
        pm: '<img src="/public/svg/pm.png" />',
        pm_no: '<img src="/public/svg/pm_no.png" />',
        baidu: '<img width="20" src="/public/svg/baidu.svg" title="Baidu Translate" />',
        youdao: '<img width="20" src="/public/svg/youdao.svg" title="Youdao Translate" />',
        sougou: '<img width="20" src="/public/svg/sougou.svg" title="Sogou Translate" />',
        tecent: '<img width="20" src="/public/svg/tecent.svg" title="Tencent Translator" />',
        google1: '<img width="20" src="/public/svg/google.svg" title="Google NMT" />',
        google2: '<img width="20" src="/public/svg/google.svg" title="Google Translate" />',
        xiaoniu: '<img width="20" src="/public/svg/xiaoniu.svg" title="NiuTrans" />',
        jinshan: '<img width="20" src="/public/svg/jinshan.jpg" title="Jinshan Translate" />',
        zkfy: '<img width="20" src="/public/svg/zkfy.svg" title="nylangTech" />',
        deepL: '<img width="20" src="/public/svg/deepl.svg" title="DeepL Translator" />',
        yyq: '<img width="20" src="/public/svg/yyq.png" title="LanMT" />'
    },
//全局变量，图标url
    iconsrc = {
        yy: '/public/svg/yy.png',
        yy_no: '/public/svg/yy_no.png',
        sh: '/public/svg/check.png',
        sh_no: '/public/svg/check_no.png',
        qa: '/public/svg/qa.png',
        qa_no: '/public/svg/qa_no.png',
        pm: '/public/svg/pm.png',
        pm_no: '/public/svg/pm_no.png'
    };
