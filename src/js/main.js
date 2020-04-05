// Точка входа в приложение
$(document).ready(function () {
  // Создание объекта-хранилища, работающего с LocalStorage
  let local = new LocStg()

  // Экземпляр класса с информацией о медицинских учреждениях
  new Hospital({ idHospital: 'hospitalId', storage: local })
})