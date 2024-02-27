const sequelize = require('../connections/db')
const {DataTypes} = require('sequelize')

const UserBot = sequelize.define('wuserbot', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    firstname: {type: DataTypes.STRING},
    lastname: {type: DataTypes.STRING},
    chatId: {type: DataTypes.STRING, unique: true},
    avatar: {type: DataTypes.STRING},
    username: {type: DataTypes.STRING},
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
    button: {type: DataTypes.STRING}, //текст кнопки;
    receivers: {type: DataTypes.STRING}, //массив получателей;
    datestart: {type: DataTypes.STRING},  //дата начала рассылки
    delivered: {type: DataTypes.BOOLEAN}, //доставлено
})

const Pretendent = sequelize.define('pretendent', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true}, 
    projectId: {type: DataTypes.STRING},  //id проекта
    workerId: {type: DataTypes.STRING}, //id специалиста;
    receiverId: {type: DataTypes.STRING}, //чат-id получателя;
    accept: {type: DataTypes.BOOLEAN}, //принято
    otclick: {type: DataTypes.INTEGER}, //кол-во откликов (нажатий)
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
}

