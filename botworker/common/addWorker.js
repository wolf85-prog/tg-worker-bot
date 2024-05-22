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
        console.error(error.message)
    }
}