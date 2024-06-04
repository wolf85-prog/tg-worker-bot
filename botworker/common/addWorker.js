require("dotenv").config();
//notion api
const { Client } = require("@notionhq/client");
const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseWorkersId = process.env.NOTION_DATABASE_WORKERS_ID

module.exports = async function addWorker(title, tg_id, age, phone, worklist, citylist, promoId) {
    try {
        const response = await notion.pages.create({
            parent: { database_id: databaseWorkersId },
            properties: {
                City: {
                    "type": "rich_text",
                    rich_text: [
                        {
                            type: 'text',
                            text: {
                                content: citylist,
                            },
                        }
                    ],
                },
                "Город": {
                    "type": "multi_select",
                    "multi_select": {
                        "options": [
                            {
                                "name": "Выбери название города",
                                "color": "red"
                            },
                            {
                                "name": "Москва",
                                "color": "blue"
                            },
                            {
                                "name": "Московская область",
                                "color": "blue"
                            },
                            {
                                "name": "Санкт-Петербург",
                                "color": "blue"
                            },

                            {
                                "name": "Анапа",
                                "color": "yellow"
                            },
                            {
                                "name": "Архангельск",
                                "color": "yellow"
                            },
                            {
                                "name": "Астрахань",
                                "color": "yellow"
                            },

                            {
                                "name": "Барнаул",
                                "color": "green"
                            },
                            {
                                "name": "Белгород",
                                "color": "green"
                            },
                            {
                                "name": "Брянск",
                                "color": "green"
                            },

                            {
                                "name": "Валдай",
                                "color": "orange"
                            },
                            {
                                "name": "Великий Новгород",
                                "color": "orange"
                            },
                            {
                                "name": "Владивосток",
                                "color": "orange"
                            },
                            {
                                "name": "Владимир",
                                "color": "orange"
                            },
                            {
                                "name": "Волгоград",
                                "color": "orange"
                            },
                            {
                                "name": "Вологда",
                                "color": "orange"
                            },
                            {
                                "name": "Воронеж",
                                "color": "orange"
                            },
                            {
                                "name": "Выборг",
                                "color": "orange"
                            },

                            {
                                "name": "Геленджик",
                                "color": "blue"
                            },
                            {
                                "name": "Гомель",
                                "color": "blue"
                            },

                            {
                                "name": "Евпатория",
                                "color": "yellow"
                            },
                            {
                                "name": "Екатеринбург",
                                "color": "yellow"
                            },
                            {
                                "name": "Елец",
                                "color": "yellow"
                            },

                            {
                                "name": "Иваново",
                                "color": "green"
                            },
                            {
                                "name": "Ижевск",
                                "color": "green"
                            },
                            {
                                "name": "Иркутск",
                                "color": "green"
                            },
                            {
                                "name": "Йошкар-Ола",
                                "color": "green"
                            },

                            {
                                "name": "Казань",
                                "color": "orange"
                            },
                            {
                                "name": "Калининград",
                                "color": "orange"
                            },
                            {
                                "name": "Калуга",
                                "color": "orange"
                            },
                            {
                                "name": "Кемерово",
                                "color": "orange"
                            },
                            {
                                "name": "Керчь",
                                "color": "orange"
                            },
                            {
                                "name": "Киров",
                                "color": "orange"
                            },
                            {
                                "name": "Кисловодск",
                                "color": "orange"
                            },
                            {
                                "name": "Кострома",
                                "color": "orange"
                            },
                            {
                                "name": "Краснодар",
                                "color": "orange"
                            },
                            {
                                "name": "Красноярск",
                                "color": "orange"
                            },
                            {
                                "name": "Курган",
                                "color": "orange"
                            },
                            {
                                "name": "Курск",
                                "color": "orange"
                            },

                            {
                                "name": "Липецк",
                                "color": "blue"
                            },
                            {
                                "name": "Луганск",
                                "color": "blue"
                            },

                            {
                                "name": "Минск",
                                "color": "yellow"
                            },
                            {
                                "name": "Мурманск",
                                "color": "yellow"
                            },
                            {
                                "name": "Муром",
                                "color": "yellow"
                            },

                            {
                                "name": "Набережные Челны",
                                "color": "green"
                            },
                            {
                                "name": "Нижний Новгород",
                                "color": "green"
                            },
                            {
                                "name": "Нижний Тагил",
                                "color": "green"
                            },
                            {
                                "name": "Новороссийск",
                                "color": "green"
                            },
                            {
                                "name": "Новосибирск",
                                "color": "green"
                            },
                            {
                                "name": "Норильск",
                                "color": "green"
                            },

                            {
                                "name": "Омск",
                                "color": "orange"
                            },
                            {
                                "name": "Орел",
                                "color": "orange"
                            },
                            {
                                "name": "Оренбург",
                                "color": "orange"
                            },

                            {
                                "name": "Пенза",
                                "color": "blue"
                            },
                            {
                                "name": "Пермь",
                                "color": "blue"
                            },
                            {
                                "name": "Петрозаводск",
                                "color": "blue"
                            },
                            {
                                "name": "Петропавловск-Камчатский",
                                "color": "blue"
                            },
                            {
                                "name": "Псков",
                                "color": "blue"
                            },
                            {
                                "name": "Пятигорск",
                                "color": "blue"
                            },

                            {
                                "name": "Ржев",
                                "color": "yellow"
                            },
                            {
                                "name": "Ростов Великий",
                                "color": "yellow"
                            },
                            {
                                "name": "Ростов-на-Дону",
                                "color": "yellow"
                            },
                            {
                                "name": "Рыбинск",
                                "color": "yellow"
                            },
                            {
                                "name": "Рязань",
                                "color": "yellow"
                            },

                            {
                                "name": "Самара",
                                "color": "green"
                            },
                            {
                                "name": "Саранск",
                                "color": "green"
                            },
                            {
                                "name": "Саратов",
                                "color": "green"
                            },
                            {
                                "name": "Севастополь",
                                "color": "green"
                            },
                            {
                                "name": "Смоленск",
                                "color": "green"
                            },
                            {
                                "name": "Соликамск",
                                "color": "green"
                            },
                            {
                                "name": "Сочи",
                                "color": "green"
                            },
                            {
                                "name": "Суздаль",
                                "color": "green"
                            },
                            {
                                "name": "Сыктывкар",
                                "color": "green"
                            },

                            {
                                "name": "Таганрог",
                                "color": "orange"
                            },
                            {
                                "name": "Тамбов",
                                "color": "orange"
                            },
                            {
                                "name": "Тверь",
                                "color": "orange"
                            },
                            {
                                "name": "Тольятти",
                                "color": "orange"
                            },
                            {
                                "name": "Тула",
                                "color": "orange"
                            },
                            {
                                "name": "Тюмень",
                                "color": "orange"
                            },

                            {
                                "name": "Ульяновск",
                                "color": "blue"
                            },
                            {
                                "name": "Уфа",
                                "color": "blue"
                            },

                            {
                                "name": "Феодосия",
                                "color": "yellow"
                            },

                            {
                                "name": "Ханты-Мансийск",
                                "color": "green"
                            },

                            {
                                "name": "Чебоксары",
                                "color": "orange"
                            },
                            {
                                "name": "Челябинск",
                                "color": "orange"
                            },
                            {
                                "name": "Череповец",
                                "color": "orange"
                            },

                            {
                                "name": "Якутск",
                                "color": "blue"
                            },
                            {
                                "name": "Ялта",
                                "color": "blue"
                            },
                            {
                                "name": "Ярославль",
                                "color": "blue"
                            },

                        ]
                    }
                },
                Phone: {
                    "type": "phone_number",
                    "phone_number": phone
                },
                Age: {
                    "type": "date",
                    date: {
                        "start": age,
                        "end": null,
                    }
                },
                Specialization: {
                    "type": "multi_select",
                    "multi_select": worklist
                },
                Telegram: {
                    "type": "number",
                    "number": tg_id
                },
                Name: {
                    title:[
                        {
                            "text": {
                                "content": title
                            }
                        }
                    ]
                },
                "Промокод ID": {
                    "type": "number",
                    "number": promoId
                },
            }
        })

        //console.log(response)

        const res_id = response.id;

        return res_id;

    } catch (error) {
        console.error("Ошибка добавления специалиста в Notion: ")
        console.error(error.message)
    }
}