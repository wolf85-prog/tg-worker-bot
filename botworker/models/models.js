const sequelize = require('../connections/db')
const {DataTypes} = require('sequelize')

const UserBot = sequelize.define('wuserbot', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    firstname: {type: DataTypes.STRING},
    lastname: {type: DataTypes.STRING},
    chatId: {type: DataTypes.STRING, unique: true},
    avatar: {type: DataTypes.STRING},
    username: {type: DataTypes.STRING},
    block: {type: DataTypes.BOOLEAN},
})

const Worker = sequelize.define('worker', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    userfamily: {type: DataTypes.STRING},
    username: {type: DataTypes.STRING},
    phone: {type: DataTypes.STRING},
    dateborn: {type: DataTypes.STRING},  
    city: {type: DataTypes.STRING},
    companys: {type: DataTypes.STRING},
    stag: {type: DataTypes.STRING},
    worklist: {type: DataTypes.STRING},
    chatId: {type: DataTypes.STRING, unique: true},
    promoId: {type: DataTypes.STRING},
    from: {type: DataTypes.STRING},
    avatar: {type: DataTypes.STRING},
    comment: {type: DataTypes.TEXT}, 
    rank: {type: DataTypes.INTEGER}, 
    block: {type: DataTypes.BOOLEAN},
    deleted: {type: DataTypes.BOOLEAN},
    newcity: {type: DataTypes.STRING},
    great: {type: DataTypes.BOOLEAN},
})

const Message = sequelize.define('wmessage', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    conversationId: {type: DataTypes.STRING},
    senderId: {type: DataTypes.STRING},
    receiverId: {type: DataTypes.STRING},    
    text: {type: DataTypes.STRING}, //текст сообщения;
    type: {type: DataTypes.STRING},      //тип сообщения;
    isBot: {type: DataTypes.BOOLEAN},
    messageId: {type: DataTypes.STRING},
    buttons: {type: DataTypes.STRING},   //названия кнопок;
    replyId: {type: DataTypes.STRING}, //id пересылаемого сообщения
})

const Conversation = sequelize.define('wconversation', {
    members: {type: DataTypes.ARRAY(DataTypes.STRING)},
})

const Distributionw = sequelize.define('distributionw', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true}, 
    text: {type: DataTypes.STRING}, //текст сообщения;
    image: {type: DataTypes.STRING}, //ссылка на картинку;
    project: {type: DataTypes.STRING}, //проект (название);
    receivers: {type: DataTypes.STRING}, //массив получателей;
    datestart: {type: DataTypes.STRING},  //дата начала рассылки
    delivered: {type: DataTypes.BOOLEAN}, //доставлено
    projectId: {type: DataTypes.STRING}, //проект (id);
    count: {type: DataTypes.INTEGER}, 
    date: {type: DataTypes.STRING},  //дата начала рассылки  
    users: {type: DataTypes.TEXT},
    button: {type: DataTypes.STRING}, //текст кнопки;
    uuid: {type: DataTypes.STRING}, //индекс рассылки;
    success: {type: DataTypes.INTEGER}, 
    report: {type: DataTypes.TEXT},
    editButton: {type: DataTypes.BOOLEAN}, //редактируемая кнопка
})

const Pretendent = sequelize.define('pretendent', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true}, 
    projectId: {type: DataTypes.STRING},  //id проекта
    workerId: {type: DataTypes.STRING}, //id специалиста;
    receiverId: {type: DataTypes.STRING}, //чат-id получателя;
    accept: {type: DataTypes.BOOLEAN}, //принято
    otclick: {type: DataTypes.INTEGER}, //кол-во откликов (нажатий)
    cancel: {type: DataTypes.INTEGER}, //кол-во отмен (нажатий)
    blockDistrib: {type: DataTypes.BOOLEAN}, //блокировка рассылки по проекту
    status: {type: DataTypes.STRING}, //статус передумал
})

const Projectcash = sequelize.define('projectcash', {
    id: {type: DataTypes.STRING, primaryKey: true}, // id проекта
    title: {type: DataTypes.STRING},  //название проекта
    dateStart: {type: DataTypes.STRING}, //начало
    dateEnd: {type: DataTypes.STRING}, //конец
    tgURLchat: {type: DataTypes.STRING}, //ссылка на чат
    manager: {type: DataTypes.STRING}, //id менеджера
    status: {type: DataTypes.TEXT}, //стытус проекта
    specs: {type: DataTypes.TEXT}, // специалисты
})

const Smetacash = sequelize.define('smetacash', {
    id: {type: DataTypes.STRING, primaryKey: true}, // id сметы
    projectId: {type: DataTypes.STRING}, // id проекта
    title: {type: DataTypes.STRING},  //название сметы (проекта)
    final: {type: DataTypes.STRING},  //финал. смета - статус
    dop: {type: DataTypes.TEXT},
    // dateStart: {type: DataTypes.STRING}, //начало
    // dateEnd: {type: DataTypes.STRING}, //конец
    // stavka: {type: DataTypes.STRING}, //
    // pererabotka: {type: DataTypes.STRING}, // 
    // gsm: {type: DataTypes.STRING}, // ГСМ
    // transport: {type: DataTypes.STRING}, // Общ. транспорт
})

const Speccash = sequelize.define('speccash', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},  // id
    specId: {type: DataTypes.STRING}, // id специалиста
    projectId: {type: DataTypes.STRING}, // id проекта
    date: {type: DataTypes.STRING}, // дата работы
    predStavka: {type: DataTypes.STRING},  //предварительная ставка
    factStavka: {type: DataTypes.STRING},  //фактическая ставка
    podtverStavka: {type: DataTypes.BOOLEAN},  //подтвержденная ставка
})

const Canceled = sequelize.define('canceled', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true}, 
    projectId: {type: DataTypes.STRING},  //id проекта
    workerId: {type: DataTypes.STRING}, //id специалиста;
    receiverId: {type: DataTypes.STRING}, //чат-id получателя;
    blockId: {type: DataTypes.STRING}, //id таблицы Претенденты;
    cancel: {type: DataTypes.BOOLEAN}, //отказано
    datestart: {type: DataTypes.STRING}, //начало
    dateend: {type: DataTypes.STRING}, //конец
})

const Specialist = sequelize.define('specialist', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},  
    fio: {type: DataTypes.STRING},
    chatId: {type: DataTypes.STRING, unique: true},
    phone: {type: DataTypes.STRING},
    phone2: {type: DataTypes.STRING},
    specialization: {type: DataTypes.TEXT},  
    city: {type: DataTypes.STRING},
    skill: {type: DataTypes.TEXT},
    promoId: {type: DataTypes.STRING}, 
    rank: {type: DataTypes.INTEGER}, 
    merch: {type: DataTypes.STRING},
    company: {type: DataTypes.STRING},
    comteg: {type: DataTypes.TEXT},
    comteg2: {type: DataTypes.TEXT},
    comment: {type: DataTypes.TEXT}, 
    comment2: {type: DataTypes.TEXT}, 
    age: {type: DataTypes.STRING},
    reyting: {type: DataTypes.STRING},
    inn: {type: DataTypes.STRING}, 
    passport: {type: DataTypes.TEXT},
    profile: {type: DataTypes.TEXT},
    dogovor: {type: DataTypes.BOOLEAN}, 
    samozanjatost: {type: DataTypes.BOOLEAN},
    passportScan: {type: DataTypes.TEXT},
    email: {type: DataTypes.STRING}, 
    blockW: {type: DataTypes.BOOLEAN},
    deleted: {type: DataTypes.BOOLEAN},
    great: {type: DataTypes.BOOLEAN}, //hello
    block18: {type: DataTypes.BOOLEAN},
    krest: {type: DataTypes.BOOLEAN}, //bad
    projectAll: {type: DataTypes.INTEGER},
    projectMonth: {type: DataTypes.INTEGER},
    lateness: {type: DataTypes.INTEGER},
    noExit: {type: DataTypes.INTEGER},
    passeria: {type: DataTypes.STRING},
    pasnumber: {type: DataTypes.STRING},
    paskemvidan: {type: DataTypes.STRING},
    pasdatevidan: {type: DataTypes.STRING},
    pascode: {type: DataTypes.STRING},
    pasbornplace: {type: DataTypes.STRING},
    pasaddress: {type: DataTypes.STRING},
    surname: {type: DataTypes.STRING},
    name: {type: DataTypes.STRING},
    secondname: {type: DataTypes.STRING},
    pasdateborn: {type: DataTypes.STRING},
    projects: {type: DataTypes.TEXT},
})

const ProjectNew = sequelize.define('projectnew', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    crmID: {type: DataTypes.STRING},
    name: {type: DataTypes.STRING},  //название проекта
    status: {type: DataTypes.STRING},
    specifika: {type: DataTypes.STRING},
    city: {type: DataTypes.STRING},
    dateStart: {type: DataTypes.STRING},  //дата начала проекта
    dateEnd: {type: DataTypes.STRING},  //дата окончания проекта
    teh: {type: DataTypes.TEXT},
    geo: {type: DataTypes.STRING},
    managerId: {type: DataTypes.STRING},
    managerId2: {type: DataTypes.STRING},
    companyId: {type: DataTypes.STRING},
    chatId: {type: DataTypes.STRING},
    spec: {type: DataTypes.STRING},
    comment: {type: DataTypes.TEXT},
    equipment: {type: DataTypes.STRING},
    number: {type: DataTypes.INTEGER},
    teh1: {type: DataTypes.STRING},
    teh2: {type: DataTypes.STRING},
    teh3: {type: DataTypes.STRING},
    teh4: {type: DataTypes.STRING},
    teh5: {type: DataTypes.STRING},
    teh6: {type: DataTypes.STRING},
    teh7: {type: DataTypes.STRING},
    teh8: {type: DataTypes.STRING},
    deleted: {type: DataTypes.BOOLEAN},
})

module.exports = {
    UserBot, 
    Worker,
    Message, 
    Conversation, 
    Distributionw,
    Pretendent,
    Projectcash,
    Smetacash,
    Speccash,
    Canceled,
    ProjectNew,
    Specialist,
}

