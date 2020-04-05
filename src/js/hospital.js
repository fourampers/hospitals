/**
 * Каталог медецинских учреждений
 */
class Hospital {
  constructor (options) {
    
    // Проверка параметров, переданных в опциях
    if (this.checkIdHospital(options) && this.checkStorage(options)) {
      this.init(options)
    }
  }

  /**
   * Проверка наличия идентификатора в опциях.
   * Идентификатор необходим для заполнения формы медицинскими учреждениями.
   * @param {object} options
   * @returns {boolean}
   */
  checkIdHospital (options) {
    if ('idHospital' in options) {
      this.hospitalForm = $('#' + options.idHospital)
      if (this.hospitalForm.length !== 0) {
        return true
      }
    }
    return false
  }

  /**
   * Проверка наличия хранилища в опциях.
   * @param {object} options
   * @returns {boolean}
   */
  checkStorage (options) {
    if ('storage' in options) {
      if (typeof options.storage != 'undefined') {
        return true
      }
    }
    return false
  }

  /**
   * Инициализация.
   * @param {object} options 
   */
  async init (options) {
    this.storage = options.storage

    const data = await this.storage.load()
    if (data === null) {
      return false
    } else {
      this.info = data.LPU
    }

    this.id = 0
    this.hid = 0

    this.creatingData()

    this.displayHead()
    this.dispalayAccordion()

    this.hid = this.headers[0].id
    this.activateCard(this.hid)

    this.chevron()
    this.allDown()

    this.createModal()
    this.createDialog()

    this.rowClick()
    this.okModalClick()
    this.removeModalClick()
    this.removeModalClickOk()

    this.addButton()
    this.jsonButton()
  }

  /**
   * Создание данных.
   * Данные представлены в виде двухуровневой иерархии: заголовки и данные.
   * @returns {void}
   */
  creatingData () {
    this.treeData = _(this.info).groupBy('hid').value()
    this.headers = []

    for (let prop in this.treeData) {
      if (this.treeData.hasOwnProperty(prop)) {
        if (prop !== 'null') {
          const obj = _.find(this.info, {'id': prop})
          this.headers.push(obj)

          let arr = this.treeData['null']
          arr.splice(_.findIndex(arr, {'id': prop}), 1)
          this.treeData['null'] = arr
        }
      }
    }

    for (let prop in this.treeData) {
      if (this.treeData.hasOwnProperty(prop)) {
        let arr = this.treeData[prop]
        arr = _.sortBy(arr, ['full_name'])
        this.treeData[prop] = arr
      }
    }

    this.headers = _.sortBy(this.headers, ['full_name'])
  }

  /**
   * Вывод заголовка таблицы.
   */
  displayHead () {
    this.hospitalForm.prepend(`<div class="hospital__control-panel">
                <button type="button" class="btn hospital__btn" id="hospitalAdd"
                        title="Добавить запись"><i class="fas fa-plus"></i></button>
                <button type="button" class="btn hospital__btn" id="hospitalAllDown"
                        title="Свернуть\\развернуть всё"><i
                        class="fas fa-angle-double-down"></i></button>
                <button type="button" class="btn hospital__btn" id="hospitalJson"
                        title="Скачать json"><i
                        class="fas fa-file-download"></i></button>
            </div>
            <table class="table hospital__table hospital__table_head">
                <tr>
                    <th scope="col" class="hospital-col-1">Наименование</th>
                    <th scope="col" class="hospital-col-2">Адрес</th>
                    <th scope="col" class="hospital-col-3">Телефон</th>
                </tr>
                </thead>
            </table>
            <div class="accordion" id="hospitalAccordion"></div>`)
  }

  /**
   * Вывод accordion для отображения данных о медицинских учреждениях.
   * @returns {void}
   */
  dispalayAccordion () {
    this.hospitalAccordion = $('#hospitalAccordion')
    this.hospitalAccordion.empty()
    this.displayCard(null)
    this.headers.forEach((elem) => {
      this.displayCard(elem.id)
    })
  }

  /**
   * Отображение карточки категории медицинского учреждения.
   * @param {number} id 
   */
  displayCard (id) {
    let obj
    if (id !== null) {
      obj = _.find(this.headers, {'id': id})
    } else {
      obj = {
        'full_name': 'Без категории',
        'address': null,
        'phone': null,
      }
    }

    this.hospitalAccordion.append(`<div class="card" id="card-${id}">
        <div class="card-header hospital__header hospital__card" id="heading-${id}">
            <table class="table table-hover hospital__table hospital__header"><thead>
                <tr class="mb-0 hospital__title-card" data-toggle="collapse"
                    data-target="#collapse-${id}" aria-expanded="true"
                    aria-controls="collapse-${id}">
                    <td class="hospital-col-1">
                        <i class="fas fa-chevron-down hospital__fas"></i>${obj.full_name !== null
      ? obj.full_name
      : ''}
                    </td>
                    <td class="hospital-col-2">${obj.address !== null ? obj.address : ''}</td>
                    <td class="hospital-col-3">${obj.phone !== null ? obj.phone : ''}</td>
                </tr>
                </thead>
            </table>
        </div>`)

    this.displayCardBody(id)

    this.hospitalAccordion.last(`</div>`)

  }

  /**
   * Отображение тела карточки лечебного учреждения.
   * @param {number} hid 
   */
  displayCardBody (hid) {
    let arr = this.treeData[hid]
    let curCard = $(`#card-${hid}`)

    curCard.append(`<div id="collapse-${hid}" class="hospital__panel collapse"
             aria-labelledby="heading-${hid}"
             data-parent="#hospitalAccordion">
            <div class="card-body hospital__card">
                <table class="table table-hover hospital__table" id="table-${hid}"><tbody>`)

    let curTable = $(`#table-${hid}`)
    arr.forEach((elem) => {
      curTable.append(`<tr class="hospital__row" data-id="${elem.id}" data-hid="${hid}" >
                        <td class="hospital-col-1">${elem.full_name !== null ? elem.full_name : ''}</td>
                        <td class="hospital-col-2">${elem.address !== null ? elem.address : ''}</td>
                        <td class="hospital-col-3">${elem.phone !== null ? elem.phone : ''}</td>
                    </tr>`)
    })

    curCard.last(`</tbody></table>
            </div>
        </div>`)

  }

  /**
   * Активация выбранного раздела.
   * @param {number} hid 
   */
  activateCard (hid) {
    $(`#collapse-${hid}`).addClass('show')
  }
  /**
   * Добавление шеврона к категории.
   * @returns {void}
   */
  chevron () {
    $('.collapse.show').each(function () {
      $(this)
        .prev('.card-header')
        .find('.fas')
        .addClass('fa-chevron-up')
        .removeClass('fa-chevron-down')
    })

    $('.collapse').on('show.bs.collapse', function () {
      $(this)
        .prev('.card-header')
        .find('.fas')
        .removeClass('fa-chevron-down')
        .addClass('fa-chevron-up')
    }).on('hide.bs.collapse', function () {
      $(this)
        .prev('.card-header')
        .find('.fas')
        .removeClass('fa-chevron-up')
        .addClass('fa-chevron-down')
    })
  }

  /**
   * Реализация переключателя скрытия/раскрытия списков.
   * @returns {void}
   */
  allDown () {
    $('#hospitalAllDown').click(function () {
      let btn = $(this).find('.fas')
      if (btn.hasClass('fa-angle-double-down')) {
        btn.removeClass('fa-angle-double-down').addClass('fa-angle-double-up')
        $('.hospital__panel')
          .removeData('bs.collapse')
          .collapse({
            parent: '',
            toggle: false,
          })
          .collapse('show')
          .removeData('bs.collapse')
          .collapse({
            parent: '#hospitalAccordion',
            toggle: false,
          })
      } else {
        btn.removeClass('fa-angle-double-up').addClass('fa-angle-double-down')
        $('.hospital__panel')
          .removeData('bs.collapse')
          .collapse({
            parent: '',
            toggle: false,
          })
          .collapse('hide')
          .removeData('bs.collapse')
          .collapse({
            parent: '#hospitalAccordion',
            toggle: false,
          })
      }
    })
  }

  /**
   * Реализация модального окна содания/редактирования записи
   * @returns {void}
   */
  createModal () {
    this.hospitalForm.append(`<div class="modal fade" id="hospitalModal" tabindex="-1" role="dialog" aria-labelledby="hospitalModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="hospitalModalLabel"></h5>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">
        <form id="hospitalFormik">
        <div class="form-group">
            <label for="recipient-name" class="col-form-label">Категория</label>
            <select class="form-control" id="hospital-headers">
              <option value="null">Без категории</option>
              <option>2</option>
            </select>
          </div>
          <div class="form-group">
            <label for="recipient-name" class="col-form-label">Наименование</label>
            <input type="text" class="form-control" id="hospital-full_name" required>
             <div class="invalid-feedback">
                Введите наименование. Это поле не пустое.
              </div>
          </div>
          <div class="form-group">
            <label for="message-text" class="col-form-label">Адрес</label>
            <input type="text" class="form-control" id="hospital-address" required>
             <div class="invalid-feedback">
                Введите адрес. Это поле не пустое.
              </div>
          </div>
           <div class="form-group">
            <label for="message-text" class="col-form-label">Телефон</label>
            <input type="text" class="form-control" id="hospital-phone" required>
             <div class="invalid-feedback">
                Введите телефон. Это поле не пустое.
              </div>
          </div>
        </form>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-danger" id="hospital__remove">Удалить запись</button>
        <button type="button" class="btn btn-secondary" data-dismiss="modal">Отмена</button>
        <button type="button" class="btn hospital__btn" id="hospital__ok">Ok</button>
      </div>
    </div>
  </div>
</div>`)

    this.hospitalModal = $('#hospitalModal')
    this.hospitalFormik = $('#hospitalFormik')[0]
  }

  /**
   * Реализация модального окна удаления записи.
   * @returns {void}
   */
  createDialog () {
    this.hospitalForm.append(`<div class="modal fade" id="hospitalDialog" tabindex="-1" role="dialog" aria-labelledby="hospitalDialogLabel" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="hospitalDialogLabel">Вы действительно хотите удалить запись?</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body" id="hospital__dialog-body">
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Отмена</button>
            <button type="button" class="btn btn-danger" id="hospital__dialog-ok">Ok</button>
          </div>
        </div>
      </div>
    </div>`)

    this.hospitalDialog = $('#hospitalDialog')
  }

  /**
   * Обработка события нажатия на строку таблицы.
   * Нажатие вызыввает модальное окно редактирования записи.
   * @returns {void}
   */
  rowClick () {
    $('.hospital__row').click((event) => {
      this.id = $(event.currentTarget).data().id
      this.hid = $(event.currentTarget).data().hid
      this.showModal(this.id, this.hid, 'Редактирование записи')
    })
  }

  /**
   * Реализации подтверждения создания/редактирования записи.
   * @returns {void}
   */
  okModalClick () {
    $('#hospital__ok').click((event) => {
      if (!this.hospitalFormik.checkValidity()) {
        event.preventDefault()
        event.stopPropagation()
      } else {
        this.saveRecord(this.id, this.hid)
        this.hospitalModal.modal('hide')
      }
      this.hospitalFormik.classList.add('was-validated')
    })
  }

  /**
   * Вывод модального окна с подтверждением удаления записи.
   * @returns {void}
   */
  removeModalClick () {
    $('#hospital__remove').click((event) => {
      this.hospitalModal.modal('hide')

      const obj = _.find(this.info, {'id': this.id + ''})
      $('#hospital__dialog-body').text(obj.full_name)

      this.hospitalDialog.modal('show')
    })
  }

  /**
   * Подтверждение удаления записи.
   * @returns {void}
   */
  removeModalClickOk () {
    $('#hospital__dialog-ok').click(() => {
      this.info.splice(_.findIndex(this.info, {'id': this.id + ''}), 1)
      this.hospitalDialog.modal('hide')
      this.storage.save({'LPU': this.info})
      this.refreshRecord(this.hid)
    })
  }

  /**
   * Создание новой записи или редактирование существующей.
   * @param {number} id 
   * @param {number} hid 
   * @returns {void}
   */
  saveRecord (id, hid) {
    let obj = _.find(this.info, {'id': id + ''})
    this.hid = $('#hospital-headers option:selected').val() + ''

    if (obj !== undefined) {
      obj.full_name = $('#hospital-full_name').val()
      obj.address = $('#hospital-address').val()
      obj.phone = $('#hospital-phone').val()
      obj.hid = this.hid
    } else {
      this.info.push({
        id: this.id + '',
        hid: this.hid,
        full_name: $('#hospital-full_name').val(),
        address: $('#hospital-address').val(),
        phone: $('#hospital-phone').val(),
      })
    }
    this.storage.save({'LPU': this.info})

    this.refreshRecord(this.hid)
  }

  /**
   * Обновление состояния при добавлении/редактировании/удалении записи
   * @param {number} hid
   * @returns {void}
   */
  refreshRecord (hid) {
    this.creatingData()
    this.dispalayAccordion()
    this.rowClick()
    this.activateCard(hid)
  }

  /**
   * Вывол модального окна создания/редактирования записи.
   * Все поля записи заполняются. 
   * @param {number} id 
   * @param {number} hid 
   * @param {string} title
   * @returns {void}
   */
  showModal (id, hid, title = '') {
    this.hospitalFormik.classList.remove('was-validated')

    const category = $('#hospital-headers')
    category.empty()

    $(
      '<option />',
      {
        value: 'null',
        text: 'Без категории',
      }).appendTo(category)

    this.headers.forEach((elem) => {

      $(
        '<option />',
        {
          value: elem.id,
          text: elem.full_name,
        }).appendTo(category)
    })

    $(`#hospital-headers option[value=${hid}]`).attr('selected', 'selected')

    const obj = _.find(this.info, {'id': id + ''})

    if (obj !== undefined) {
      $('#hospital-full_name').val(this.isNull(obj.full_name))
      $('#hospital-address').val(this.isNull(obj.address))
      $('#hospital-phone').val(this.isNull(obj.phone))
    } else {
      $('#hospital-full_name').val('')
      $('#hospital-address').val('')
      $('#hospital-phone').val('')
    }

    $('#hospitalModalLabel').text(title)

    this.hospitalModal.modal('show')
  }

  /**
   * Проверка на null.
   * @param {*} val
   * @returns {(string|*)} Возвращает пустую строку либо само значение.
   */
  isNull (val) {
    return _.isNull(val) ? '' : val
  }

  /**
   * Реализация кнопки создания новой записи.
   * @returns {void} 
   */
  addButton () {
    $('#hospitalAdd').click(() => {
      this.id = _.maxBy(this.info, function (o) { return +o.id }).id + 1
      this.hid = null

      this.showModal(this.id, this.hid, 'Добавить новую запись')
    })
  }

  /**
   * Реализация кнопки сохранения в JSON.
   * @returns {void}
   */
  jsonButton () {
    $('#hospitalJson').click(() => {
      const json = this.storage.get()
      let a = document.createElement('a')
      this.hospitalForm.after(a)
      a.style = 'display: none'
      let blob = new Blob([json], {type: 'octet/stream'}),
        url = window.URL.createObjectURL(blob)
      a.href = url
      a.download = '.result.json'
      a.click()
      window.URL.revokeObjectURL(url)
      $(a).remove()
    })
  }
}
