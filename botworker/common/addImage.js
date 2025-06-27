require("dotenv").config();

module.exports = async function addImage(url_image, pageId) {

    console.log(
                    {
                        "url": url_image,
                    },)
    try {
        //сохранение паспорт
        const response = await Specialist.update({
                profile: url_image,
            },
            {
                where: {id: parseInt(pageId)}
            })

        const res_id = response.id;

        return res_id;

    } catch (error) {
        console.error("Ошибка добавления аватара в ф-и addImage())", error.message)
    }
}