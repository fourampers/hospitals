/**
 * Класс работы с LocalStorage
 */
class LocStg {

  /**
   * Сохранить данные в LocalStorage.
   * @param {*} data 
   */
  save (data) {
    localStorage.setItem('json', JSON.stringify(data))
  }

  /**
   * Загрузить каталог медицинских учреждений.
   * @returns {void}
   */
  async load () {
    const value = localStorage.getItem('json')
    if (!value) {
      try {
        const result = await $.get('json/lpu.json')
        this.save(this.optimize(result))
        return result
      } catch (error) {
        console.error(`Ошибка: ${error.statusText}`)
        return null
      }
    } else {
      return value ? JSON.parse(value) : null
    }
  }

  /**
   * Стереть данные из LocalStorage.
   * @returns {void}
   */
  erase () {
    localStorage.removeItem('json')
  }

  /**
   * Оптимизировать каталог путем удаления ненужных символов.
   * @param {*} data 
   */
  optimize (data) {
    let info = data.LPU

    info.forEach((elem) => {
      if (elem.full_name !== null) {
        elem.full_name = elem.full_name.replace(/<[^>]+>/g, '').trim()
      }
      if (elem.address !== null) { elem.address = elem.address.trim()}
      if (elem.phone !== null) {elem.phone = elem.phone.trim()}
    })
    return {'LPU': info}
  }

  /**
   * Получить элемент из LocalStorage.
   * @returns {void}
   */
  get () {
    return localStorage.getItem('json')
  }
}