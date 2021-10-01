function UpdateDatabaseResources()
{
  if(Api.GetDatabaseStructure().length == 0)
    return 
  let json = Api.GetDatabaseStructure()
  $('[data-resource-type="Database"]').each(function(index, el){
    let SelectedValue = $(el).find("select option:selected").val()
    let TableId = parseInt($(el).attr("data-default-table-id"))
    let DefaultValue = $(el).attr("data-default-value")
    let FirstTimeSetup = $(el).attr("data-not-initialized")!="true"
    $(el).attr("data-not-initialized","true")
    if(DefaultValue.length == 0)
    {
     DefaultValue = [] 
    }else
    {
      DefaultValue = DefaultValue.split(",")
    }
    if(DefaultValue.length > 0)
      DefaultValue = DefaultValue[0]
    else
      DefaultValue = ""

    json.forEach(function(Table){
      if(Table["id"] == TableId)
      {
        let Groups = Table["groups"]
        let select = $(el).find("select")
        select.html("")
        if(FirstTimeSetup)
        {
          SelectedValue = DefaultValue
        }

        let el1 = $(`<option class="ui-internal" ${("0" == SelectedValue) ? `selected="selected"` : ``}></option>`)
        el1.text("-----")
        el1.attr("value", "0")
        select.append(el1)

        Groups.forEach(function(Group){
          let el = $(`<option class="ui-internal" ${(Group["id"] == SelectedValue) ? `selected="selected"` : ``}></option>`)
          el.text(Group["name"])
          el.attr("value", Group["id"])
          select.append(el)
        })
      }  
    })
    

  })
  
}

function InitManualCaptchaSolver()
{
    window.CaptchaDialog = UIkit.modal(`
        <div id="CaptchaModal" class="uk-modal-full" style="font-size:small;" uk-modal>
          <div class="uk-modal-dialog">
            <button class="uk-modal-close-full uk-close-large" type="button" uk-close></button>
            <div uk-height-viewport >
              <div style="padding:15px;border-bottom:1px solid rgb(221, 221, 221);">
                <h3 style="margin-bottom:0px">${tr('Captcha list')}</h3>
              </div>
              <div style="z-index: 9999999999;" id="ListOfCaptchas">
                
              </div>
            </div>
          </div>
        </div>
    `)
    ClearCaptchas()


  $("#CaptchaNotification").click(function(){
    window.CaptchaDialog.show()
  })
}

function ClearCaptchas()
{
  $("#CaptchaNotification").hide()
  $("#ListOfCaptchas").html("")
  $("#CaptchaNumber").html("0")
}

function AddCaptcha(Id, IsImage, Data)
{
  $("#CaptchaNotification").show()
  let CurrentValue = parseInt($("#CaptchaNumber").html()) + 1
  $("#CaptchaNumber").html(CurrentValue)
  let captcha = null

  if(IsImage)
    captcha = $(`<img style="padding-bottom: 10px;"/>`).attr("src","data:image/png;base64," + Data)
  else
    captcha = $(`<div style="padding-bottom: 10px;"/>`).text(Data)


  let el = $(`
  <div uk-grid style="margin-top:10px;border-bottom:1px solid rgb(221, 221, 221);padding:20px" class="CaptchaPanel" data-captcha-id="${Id}">
    <div class="uk-width-1-2@s uk-flex uk-flex-middle uk-flex-center CaptchaContainer"></div>
    <div class="uk-width-1-2@s">
      <div><input type="text" placeholder="Captcha result" class="uk-input CaptchaResult"/></div>
      <div>
        <div class="row" style="padding: 10px 0 10px 0;">
        <div class="cell" style="flex-basis: 50%;flex-grow: 0;flex-shrink: 0;padding: 0 2px 0 0;">
          <button class="uk-button uk-button-small uk-button-default uk-width-1-1 CaptchaAccept" style="margin: 0 10px 0 0;">Ok</button>
        </div>
        <div class="cell" id="ihxhgi">
        <button class="uk-button uk-button-small  uk-button-default uk-width-1-1 CaptchaCancel" style="margin: 0px;">Cancel</button>
        </div>
        </div>
      </div>
    </div>
  </div>
  `)

  el.find(".CaptchaContainer").append(captcha)

  let DialogEl = $(window.CaptchaDialog.$el)

  let CloseCaptcha = function(panel)
  {
    let CurrentValue = parseInt($("#CaptchaNumber").html()) - 1
    if(CurrentValue<=0)
    {
      $("#CaptchaNotification").hide()
      CurrentValue = 0
    }

    $("#CaptchaNumber").html(CurrentValue)
    
    panel.remove()
    if(DialogEl.find(".CaptchaPanel").length == 0)
    {
      window.CaptchaDialog.hide()
    }else
    {
      if(DialogEl.find(".CaptchaResult").length > 0)
        $(DialogEl.find(".CaptchaResult")[0]).focus()
    }
  }


  el.find(".CaptchaAccept").click(function(event){
    
    let panel = $(event.currentTarget).parents(".CaptchaPanel")
    CloseCaptcha(panel)
    Api.CaptchaSolved(parseInt(panel.attr("data-captcha-id")), true, panel.find(".CaptchaResult").val())
    
  })
  el.find(".CaptchaCancel").click(function(event){
    let panel = $(event.currentTarget).parents(".CaptchaPanel")
    CloseCaptcha(panel)
    Api.CaptchaSolved(parseInt(panel.attr("data-captcha-id")), false, tr("Closed by user"))
  })
  
  el.find(".CaptchaResult").keypress(function (e) {
   var key = e.which;
   if(key == 13)
   {
      let element = $(e.currentTarget)
      element.parent().parent().find(".CaptchaAccept").click()
      return false;  
   }
  });

  DialogEl.find("#ListOfCaptchas").append(el)

}


function GetValue(Name)
{
  let Card = $(`[data-resource-name='${Name}']`)
  if(Card.length == 0)
  {
    console.log("Failed to find resource with name " + Name + ". Did you forget to override GetResourceValue function?")
    return ""
  }
  let Type = Card.attr("data-resource-type")
  try
  {
    if(Type == "FixedString")
      return Card.find("input").val()
    if(Type == "FixedInteger")
      return Card.find("input").val()
    if(Type == "RandomInteger")
      return $(Card.find("input").get(0)).val() + "," + $(Card.find("input").get(1)).val()
    if(Type == "RandomString")
      return Card.find("input").val()
    if(Type == "LinesFromFile")
      return Card.find("input").val()
    if(Type == "FilesFromDirectory")
      return Card.find("input").val()
    if(Type == "LinesFromUrl")
      return Card.find("input").val()
    if(Type == "Select")
    {
      let SelectType = Card.attr("data-select-type")
      if(SelectType == "0")
      {
        return Card.find("select").val()
      }else if(SelectType == "1")
      {
        return Card.find('input:checked').val()
      }else if(SelectType == "2" || SelectType == "3")
      {
        
        let all = Card.find("input[type=checkbox]:checked")
        let val = []
        if(all.length > 0)
        {
          for(let i = 0;i<all.length;i++)
          {
            val.push($(all[i]).attr("value"))
          }
        }
        return val.join(",")
        
      }
      return ""
    }
    if(Type == "Database")
    {
      return Card.find("select").val()
    }
      
  }catch(e)
  {

  }
  console.log("Failed to find resource with name " + Name + ". Did you forget to override GetResourceValue function?")
  return ""
}

function SetValue(Name, Value)
{
  let Card = $(`[data-resource-name='${Name}']`)
  if(Card.length == 0)
  {
    console.log("Failed to find resource with name " + Name + ". Did you forget to override SetResourceValue function?")
    return
  }
  let Type = Card.attr("data-resource-type")
  let Found = false
  try
  {
    if(Type == "FixedString")
    {
      Found = Card.find("input").length > 0
      Card.find("input").val(Value).trigger("change");
    }
    if(Type == "FixedInteger")
    {
      Found = Card.find("input").length > 0
      Card.find("input").val(Value).trigger("change");
    }
    if(Type == "RandomInteger")
    {
      Found = Card.find("input").length > 1
      let split = Value.split(",")
      $(Card.find("input").get(0)).val(split[0]).trigger("change");
      $(Card.find("input").get(1)).val(split[1]).trigger("change");
    }
    if(Type == "RandomString")
    {
      Found = Card.find("input").length > 0
      Card.find("input").val(Value).trigger("change");
    }
    if(Type == "LinesFromFile")
    {
      Found = Card.find("input").length > 0
      Card.find("input").val(Value).trigger("change");
    }
    if(Type == "FilesFromDirectory")
    {
      Found = Card.find("input").length > 0
      Card.find("input").val(Value).trigger("change");
    }
    if(Type == "LinesFromUrl")
    {
      Found = Card.find("input").length > 0
      Card.find("input").val(Value).trigger("change");
    }
    if(Type == "Select")
    {
      let SelectType = Card.attr("data-select-type")
      if(SelectType == "0")
      {
        Found = Card.find("select").length > 0
        Card.find("select").val(Value).trigger("change");
      }else if(SelectType == "1")
      {
        Found = Card.find(`[value="${Value}"]`).length > 0
        Card.find(`[value="${Value}"]`).prop('checked', true);
        Card.find("input").trigger("change");
      }else if(SelectType == "2" || SelectType == "3")
      {
        Found = Card.find(`input`).length > 0
        Card.find(`input`).prop('checked', false);

        Value.split(",").forEach(function(v){
          Card.find(`[value="${v}"]`).prop('checked', true);
        })
        Card.find("input").trigger("change");
      }
    }else if(Type == "Database")
    {
      Found = Card.find(`select`).length > 0
      let SelectElement = Card.find("select")
      let Values = SelectElement.find("option").toArray().map(el => $(el).val())
      if(Values.indexOf(Value) >= 0)
      {
        SelectElement.val(Value).trigger("change");
      }else
        SelectElement.val("0").trigger("change");
    }
      
  }catch(e)
  {

  }
  if(!Found)
    console.log("Failed to find resource with name " + Name + ". Did you forget to override SetResourceValue function?")

}


function InitTranslations(Translations)
{
  try
  {
    window._K = navigator.language.split("-")[0]
  }
  catch(e)
  {
    window._K = "en"  
  }

  $(".uk-tab a").addClass("tr")
  $(".resource-label").addClass("tr")
  
  window._L =  
  {
    "Run": {"ru": "Запуск"},
    "About": {"ru": "О программе"},
    "Script name": {"ru": "Название скрипта"},
    "Version": {"ru": "Версия"},
    "Made with": {"ru": "Сделано с помощью"},
    "Restore deaults": {"ru": "Сбросить настройки"},
    "There are incorrectly filled fields on the form. Are you sure, that you want to continue?": {"ru": "На форме присутствуют неправильно заполненые поля. Вы уверены, что хотите продолжить?"},
    "Status": {"ru": "Статус"},
    "Script is running. You can stop it at any time with \"Stop\" button. \"Restart\" button will immediatelly stop script and show parameters input screen so you could start it again.": {"ru": "Скрипт запущен. Вы можете остановить его в любое время с помощью кнопки \"Остановить\". Кнопка \"Перезапустить\" немедленно остановит скрипт и отобразит экран ввода параметров, чтобы вы могли запустить его снова."},
    "Running": {"ru": "Запущен"},
    "Stop": {"ru": "Остановить"},
    "Restart": {"ru": "Перезапустить"},
    "Stopped": {"ru": "Остановлен"},
    "Script is stopped. Hit \"Restart\" button to show parameters input screen so you could start it again.": {"ru": "Скрипт остановлен. Нажмите кнопку \"Перезапустить\", чтобы отобразить экран ввода параметров, для повторного запуска скрипта."},
    "Browsers": {"ru": "Браузеры"},
    "Please select script stop type. If \"Wait each thread\" option is selected, script won't be stopped until all threads will finish its work and therefore this method will take some time. \"Stop instant\" will interrupt script at same second, but all thread data will be lost.": {"ru": "Выберите тип остановки скрипта. Если выбран вариант \"Ждать каждый поток\", скрипт не будет остановлен, пока все потоки не закончат работу, и поэтому остановка займет некоторое время. \"Остановить мгновенно\" прервет скрипт в ту же секунду, но все данные потоков будут потеряны."},
    "Stop instant": {"ru": "Остановить мгновенно"},
    "Wait each thread": {"ru": "Ждать каждый поток"},
    "Browsers started.": {"ru": "Запущено браузеров."},
    "Inspect browsers": {"ru": "Просмотр браузеров"},
    "Browser content viewer": {"ru": "Просмотр содержимого браузеров"},
    "Click on any button to inspect browser.": {"ru": "Нажмите любую кнопку, чтобы показать браузер."},
    "Screenshots from browser #": {"ru": "Скриншоты из браузера №"},
    "image is constantly updated": {"ru": "изображение постоянно обновляется"},
    "Back": {"ru": "Назад"},
    "Browser #": {"ru": "Браузер №"},
    "Download log": {"ru": "Скачать лог"},
    "Download": {"ru": "Скачать"},
    "Progress": {"ru": "Ход работы"},
    "Threads running.": {"ru": "Запущено потоков."},
    "Success executions.": {"ru": "Успешных выполнений."},
    "Failures.": {"ru": "Ошибок."},
    "Report": {"ru": "Отчет о работе"},
    "Script report": {"ru": "Отчет о работе"},
    "No success or fail executions during last ten minutes": {"ru": "Не было успешных или неудачных выполнений в течение последних десяти минут"},
    "Success number": {"ru": "Успешных выполнений"},
    "Fail number": {"ru": "Неудачных выполнений"},
    "Successes and fails": {"ru": "Успехов и неудач"},
    "Logs": {"ru": "Лог"},
    "Resources report": {"ru": "Отчет о ресурсах"},
    "Path to file": {"ru": "Путь к файлу"},
    "Path to folder": {"ru": "Путь к папке"},
    "Root folder": {"ru": "Корневая папка"},
    "Select": {"ru": "Выбрать"},
    "Select file": {"ru": "Выбрать файл"},
    "Select folder": {"ru": "Выбрать папку"},
    "Captcha list": {"ru": "Список капч"},
    "Browser list is empty.": {"ru": "Список браузеров пустой."},
    "Image unavailable. Possibly browser is closed.": {"ru": "Изображение недоступно. Возможно браузер закрыт."},
    "Browser is under user control": {"ru": "Браузер под контролем пользователя"},
    "Open": {"ru": "Открыть"},
    "Browsers under user control.": {"ru": "Браузеров под контролем пользователя."},
    "Show scheduler": {"ru": "Показать планировщик"},

    
  }
  window._L = Object.assign(Translations, window._L);
  Translate()
}


function Translate(Language)
{
  if(Language)
    window._K = Language

  var all = $(".tr")
    
  for(var i = 0;i< all.length;i++)
  {
    var el = $(all[i])
    if(typeof(el.attr("tr")) == "undefined")
    {
      el.attr("tr",el.html())
    }
    el.html(tr(el.attr("tr")))
  }

  all = $(".trtitle")
  for(var i = 0;i< all.length;i++)
  {
    var el = $(all[i])
    if(typeof(el.attr("trtitle")) == "undefined")
    {
      el.attr("trtitle",el.attr("title"))
    }
    el.attr("title",tr(el.attr("trtitle")))
  }

  var all = $("*[placeholder]")
  for(var i = 0;i< all.length;i++)
  {
    var el = $(all[i])
    if(typeof(el.attr("trplaceholder")) == "undefined")
    {
      el.attr("trplaceholder",el.attr("placeholder"))
      
    }
    el.attr("placeholder",tr(el.attr("trplaceholder")))
  }

  if(typeof(_K) != "undefined" && (_K == "ru" || _K == "en"))
  {
    $(".tr-en").hide()
    $(".tr-ru").hide()
    $(".tr-" + _K).show()
  }


}

function tr(key)
{
  if(typeof(_K) == "undefined" || _K == "en")
    return key;
  if(key in _L)
  {

    if(_K in _L[key])
    {
      return _L[key][_K]
    }
  }
  return key;
}


function InitFileAndFolderChooserButtons()
{
  $(".server-side-file-dialog button").click(function(event)
  {
    let el = $(event.currentTarget)
    if(typeof(ApiVersion) == "number" && ApiVersion >= 1)
    {
      
      Api.OpenFileDialog({}).then(function(SelectedFile){
        if(SelectedFile)
        {
          let input = el.parent().find("input")
          input.val(SelectedFile)
          input.trigger("change");
        }
      })
    }else
    {
      ShowFileChooser().then(function(res)
      {
        let input = el.parent().find("input")
        input.val(res)
        input.trigger("change");
      })
    }

  })
  $(".server-side-folder-dialog button").click(function(event)
  {
    let el = $(event.currentTarget)
    if(typeof(ApiVersion) == "number" && ApiVersion >= 1)
    {
      
      Api.OpenFileDialog({is_dir:true}).then(function(SelectedFile){
        if(SelectedFile)
        {
          let input = el.parent().find("input")
          input.val(SelectedFile)
          input.trigger("change");
        }
      })
    }else
    {
      ShowFolderChooser().then(function(res)
      {
        let input = el.parent().find("input")
        input.val(res)
        input.trigger("change");
      })
    }

  })
}

function ShowFileChooser()
{
  return ShowFileOrFolderChooser(tr("Select file"), function(El, ChangeFolder, Resolve, Dialog)
  {
    ChangeFolder(JSON.parse(El.attr("data-location")))
  }, function(El, ChangeFolder, Resolve, Dialog)
  {
    window.LastSelectedFolder = JSON.parse(El.attr("data-location"))
    Resolve(window.LastSelectedFolder.join("/"))
    window.LastSelectedFolder.pop()
    Dialog.hide()
  }, function(El, ChangeFolder, Resolve, Dialog){
      if(El.hasClass("file-card"))
      {
          window.LastSelectedFolder = JSON.parse(El.attr("data-location"))
          Resolve(window.LastSelectedFolder.join("/"))
          window.LastSelectedFolder.pop()
          Dialog.hide()
      }else if(El.hasClass("back-card") || El.hasClass("folder-card"))
      {
          ChangeFolder(JSON.parse(El.attr("data-location")))
      }
  })

}

function ShowFolderChooser()
{
  return ShowFileOrFolderChooser(tr("Select folder"), function(El, ChangeFolder, Resolve, Dialog)
  {
    ChangeFolder(JSON.parse(El.attr("data-location")))

  }, function(El, ChangeFolder, Resolve, Dialog)
  {
  }, function(El, ChangeFolder, Resolve, Dialog){
      if(El.hasClass("file-card"))
      {

      }else if(El.hasClass("folder-card"))
      {
        window.LastSelectedFolder = JSON.parse(El.attr("data-location"))
        Resolve(window.LastSelectedFolder.join("/"))
        Dialog.hide()
      }else if(El.hasClass("back-card"))
      {
        ChangeFolder(JSON.parse(El.attr("data-location")))        
      }
  })
}

function ShowFileOrFolderChooser(Title, OnFolderDoubleClick, OnFileDoubleClick, OnSelectClicked)
{
  

  return new Promise(resolve => {
  
    ///// Show modal
    let dialog = UIkit.modal(`
    <div id="FileChooser" class="uk-modal-full" uk-modal style="-webkit-user-select: none;-moz-user-select: none;-ms-user-select: none; user-select: none;   ">
      <div class="uk-modal-dialog">
        <button class="uk-modal-close-full uk-close-large" type="button" uk-close></button>
        <div uk-height-viewport style="display: flex;flex-direction: column;">
          <div style="padding:15px;border-bottom:1px solid rgb(221, 221, 221);">
            <h3 style="margin-bottom:0px">${Title}</h3>
          </div>
          <ul class="uk-breadcrumb" id="FolderPath" style="margin-left: 25px;">
          </ul>
          <div id="FilesAndFolders" class="uk-grid-small" uk-grid style="margin:15px;" >
          </div>
          <div class="uk-margin uk-flex-center uk-flex" style="margin-right: 30px;">
            <button id="AcceptFileDialog" class="uk-button uk-button-primary" style="float: right;" disabled>
              <span uk-icon="icon: check; ratio: 1.5" class="uk-icon"></span>
              <span class="uk-text-middle">${tr('Select')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
    `)

    dialog.show()

    UIkit.util.on("#FileChooser", 'hidden', function () {
      dialog.$destroy(true);
    });

    let ChangeFolder = function(CurrentFolder)
    {

      let Container = $("#FilesAndFolders")
      Container.html("<div uk-spinner></div>")
      $("#AcceptFileDialog").hide()
      if(CurrentFolder.length == "")
      {
        $("#FolderPath").html(`<li><span>${tr('Root folder')}</span></li>`)
      }else
      {
        $("#FolderPath").html(CurrentFolder.map((el) => {
          let res = $('<li><span>Item</span></li>')
          res.find("span").text(el)
          return res.html()
        }))
      }
      
      Api.GetFolderContent(CurrentFolder).then((res) => {
        $("#AcceptFileDialog").attr("disabled","disabled").show()
        let Container = $("#FilesAndFolders")
        Container.html("")
        if(CurrentFolder.length > 0)
        {
          let e = $(`<div class="uk-card uk-card-default uk-card-body uk-first-column uk-flex uk-flex-middle uk-flex-center uk-small-margin file-item back-card">
                <div>
                  <span uk-icon="icon: reply; ratio: 1.2" class="uk-icon"></span>
                </div>
              </div>`)
          

          let CurrentLocation = CurrentFolder.slice();
          CurrentLocation.pop()
          e.attr("data-location",JSON.stringify(CurrentLocation))
          $("#FilesAndFolders").append(e)
        }

        res.forEach(function(Item){
            let e = $(`<div class="uk-card uk-card-default uk-card-body uk-first-column uk-flex uk-flex-middle uk-flex-center uk-small-margin file-item ${(Item["is_folder"]) ? "folder-card":"file-card"}">
                <div>
                  <span uk-icon="${(Item["is_folder"]) ? "folder":"copy"}" class="uk-icon" style="margin-right: 4px;"></span>
                  <span class="uk-text-middle"></span>
                </div>
            </div>`)
            e.find(".uk-text-middle").text(Item["name"]).css("word-break","break-all")
            let CurrentLocation = CurrentFolder.slice();
            CurrentLocation.push(Item["name"])
            e.attr("data-location",JSON.stringify(CurrentLocation))
            $("#FilesAndFolders").append(e)

        })
        $(".file-card").click(function(event){
          event.stopPropagation()
          let el = $(event.currentTarget)
          $(".file-card,.folder-card,.back-card").removeClass("uk-card-primary")
          $(".file-card,.folder-card,.back-card").addClass("uk-card-default")
          el.addClass("uk-card-primary")
          $("#AcceptFileDialog").removeAttr("disabled")
        })
        $(".folder-card").click(function(event){
          event.stopPropagation()
          let el = $(event.currentTarget)
          $(".file-card,.folder-card,.back-card").removeClass("uk-card-primary")
          $(".file-card,.folder-card,.back-card").addClass("uk-card-default")
          el.addClass("uk-card-primary")
          $("#AcceptFileDialog").removeAttr("disabled")
        })
        $(".back-card").click(function(event){
          event.stopPropagation()
          let el = $(event.currentTarget)
          $(".file-card,.folder-card,.back-card").removeClass("uk-card-primary")
          $(".file-card,.folder-card,.back-card").addClass("uk-card-default")
          el.addClass("uk-card-primary")
          $("#AcceptFileDialog").removeAttr("disabled")
        })
        $("#FileChooser").click(function(){
          $(".file-card,.folder-card,.back-card").removeClass("uk-card-primary")
          $("#AcceptFileDialog").attr("disabled","disabled")
        })
        
        $(".back-card, .folder-card").dblclick(function(event){
          let el = $(event.currentTarget)
          OnFolderDoubleClick(el, ChangeFolder, resolve, dialog)
          
        })

        $(".file-card").dblclick(function(event){
          let el = $(event.currentTarget)
          OnFileDoubleClick(el, ChangeFolder, resolve, dialog)
          
        })
        
      })
    }
    if(window.LastSelectedFolder)
      ChangeFolder(window.LastSelectedFolder)
    else
      ChangeFolder([])

    $("#AcceptFileDialog").click(function(){
      let el = $("#FilesAndFolders .uk-card-primary")
      OnSelectClicked(el, ChangeFolder, resolve, dialog)
      
    })

  });
  
}

  /////Set script report data
  function UpdateBrowsersIds(){
    if(Object.keys(window.BrowserIds).length == 0)
      $("#Browsers").html(tr("Browser list is empty."));
    else
      $("#Browsers").html("");

    Object.keys(window.BrowserIds).forEach(function(ThreadNumber){
      let BrowserId = window.BrowserIds[ThreadNumber]
      if(BrowserId)
      {
        var ManualStyleModificator = ""
        if(window.BrowsersWithManualControl.indexOf(BrowserId) >= 0)
          ManualStyleModificator = "uk-text-danger"

        $("#Browsers").append($(`<button class='uk-button uk-button-default view-browser' style='min-width:200px;margin-right:10px' data-thread-number="${ThreadNumber}" data-browser-id="${BrowserId}"></button>`).html(`<span uk-icon="icon: world"></span> <span class="uk-text-middle ${ManualStyleModificator}">${tr('Browser #')}${ThreadNumber}</span>`))
      }
    })  

    $(".view-browser").click(function(event){
      let el = $(event.currentTarget)
      $("#BrowserListBrowserNumber").html(el.attr("data-thread-number"))
      $("#BrowserScreen").hide()
      $("#BrowserCursor").hide()
      $("#ImageUnavailable").hide()

      StartUpdatingBrowser(parseInt(el.attr("data-browser-id")))
    });
  }

  

  function StartUpdatingBrowser(BrowserId)
  {
    $("#BrowserListStep1").hide()
    $("#BrowserListStep2").show()

    var IsManualControl = window.BrowsersWithManualControl.indexOf(BrowserId) >= 0

    if(IsManualControl)
    {
      $("#OpenBrowserInfo").show()
      $("#OpenBrowser").attr("data-browser-id", BrowserId)
    }else
    {
      $("#OpenBrowserInfo").hide()
    }
    
    window.TimeoutBrowserUpdateIsActive = true
    Api.ViewBrowser(BrowserId).then((res)=>{
      if(!window.TimeoutBrowserUpdateIsActive)
        return
      if(res["width"] < 10)
      {
        $("#BrowserScreen").hide()
        $("#BrowserCursor").hide()
        $("#ImageUnavailable").show()
        return
      }  
      $("#BrowserScreen").show()
      $("#BrowserCursor").show()
      $("#ImageUnavailable").hide()
      
      $("#BrowserScreen").attr("src","data:image/png;base64," + res.image)
      let top = $('#BrowserScreen').offset().top - $('#BrowserListModal').offset().top;
      let left = $('#BrowserScreen').offset().left - $('#BrowserListModal').offset().left
      
      let x = parseInt(res["x"] * $('#BrowserScreen').width() / res["width"])
      let y = parseInt(res["y"] * $('#BrowserScreen').height() / res["height"])
      if(x > $('#BrowserScreen').width())
      {
        x = $('#BrowserScreen').width()
      }
      if(y > $('#BrowserScreen').height())
      {
        y = $('#BrowserScreen').height()
      }
      $("#BrowserCursor").show()
      $('#BrowserCursor').css({top: top + y + $("#BrowserListModal").scrollTop(), left: left + x + $("#BrowserListModal").scrollLeft()});
      if(window.TimeoutUpdateImage)
      {
        clearTimeout(window.TimeoutUpdateImage)
        window.TimeoutUpdateImage = null
      }  
      window.TimeoutUpdateImage = setTimeout(function(){
        StartUpdatingBrowser(BrowserId)
      },2000)  
    })
    
  }

function InitBrowserViewer()
{
  ClearBrowserViewer()
  /////Show script report
  $("#InspectBrowsers").on("click", function() {

  ///// Show modal
  let BrowserListDialog = UIkit.modal(`
<div id="BrowserListModal" class="uk-modal-full" style="font-size:small;" uk-modal>
  <div class="uk-modal-dialog">
    <button class="uk-modal-close-full uk-close-large" type="button" uk-close></button>
    <div uk-height-viewport >
      <div style="padding:15px;border-bottom:1px solid rgb(221, 221, 221);">
        <h3 style="margin-bottom:0px">${tr('Browser content viewer')}</h3>
      </div>
      <div style="z-index: 9999999999;">
        <div id="BrowserListStep1">
          <div style="margin:15px">${tr('Click on any button to inspect browser.')}</div>
          <div id="Browsers" class="uk-grid-small" style="margin:15px" uk-grid ></div>
        </div>
        <div id="BrowserListStep2" style="display:none;">
          
          <span id="BrowserCursor" style="position:fixed;display:none;filter: drop-shadow( 3px 3px 5px #000 );transition: all 1s ease;">
            <svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve" width="20" height="20">
              <path style="fill:#fcc54e;" d="M245.342,511.988c-3.802,0-7.479-2.042-9.406-5.614l-52.927-98.308L82.207,508.864
                c-3.063,3.052-7.646,3.989-11.625,2.312c-3.99-1.646-6.583-5.541-6.583-9.854V10.679c0-4.26,2.531-8.104,6.437-9.791
                c3.906-1.719,8.448-0.885,11.542,2.021l362.667,341.317c3.188,3,4.219,7.635,2.604,11.697c-1.615,4.073-5.542,6.739-9.917,6.739
                h-146.25l48.979,90.944c1.365,2.531,1.646,5.521,0.771,8.27c-0.865,2.75-2.813,5.031-5.396,6.323l-85.333,42.665
                C248.571,511.624,246.946,511.988,245.342,511.988z" stroke="#000" stroke-width="35"></path>
            </svg>


          </span>

          <div style="margin:15px"><a id="ToBrowserListStep1" class="uk-link-muted" ><span uk-icon="reply"></span> ${tr('Back')}</a></div>
          <div style="margin:15px" id="OpenBrowserInfo">${tr('Browser is under user control')} (<a id="OpenBrowser">${tr('Open')}</a>). </div>
          <div style="margin:15px">${tr('Screenshots from browser #')}<span id="BrowserListBrowserNumber"></span> (${tr('image is constantly updated')}) : </div>
          <div style="padding-top: 15px;border-top: 1px solid rgb(221, 221, 221);">
            <img id="BrowserScreen" class="uk-align-center" style="margin-bottom:0px;border-radius:4px"/>
            <div id="ImageUnavailable" style="display:none;margin:15px">${tr("Image unavailable. Possibly browser is closed.")}</div>
          </div>

        </div>
      </div>
    </div>
  </div>
</div>
`)

  BrowserListDialog.show()

  window.TimeoutUpdateImage = null
  window.TimeoutBrowserUpdateIsActive = false

  /////Destroy report when hidden   
  UIkit.util.on("#BrowserListModal", 'hidden', function () {
    BrowserListDialog.$destroy(true);
    if(window.TimeoutUpdateImage)
    {
      clearTimeout(window.TimeoutUpdateImage)
      window.TimeoutUpdateImage = null
    }
  });

  UpdateBrowsersIds()

  $("#ToBrowserListStep1").click(function(event){
    if(window.TimeoutUpdateImage)
    {
      clearTimeout(window.TimeoutUpdateImage)
      window.TimeoutUpdateImage = null
    }
    UpdateBrowsersIds()

    $("#BrowserListStep1").show()
    $("#BrowserListStep2").hide()
    window.TimeoutBrowserUpdateIsActive = false
  })

  $("#OpenBrowser").click(function(event){
    var BrowserId = parseInt($("#OpenBrowser").attr("data-browser-id"))
    Api.ShowBrowser(BrowserId)
  })



 })
}

function ClearBrowserViewer()
{
    window.BrowserIds = {}
    window.BrowsersWithManualControl = []
}

function AddBrowser(BrowserId, ThreadNumber)
{
  window.BrowserIds[ThreadNumber] = BrowserId
  UpdateBrowsersIds()
}

function RemoveBrowser(BrowserId, ThreadNumber)
{
  window.BrowserIds[ThreadNumber] = null
  UpdateBrowsersIds()
}

function ManualControlStart(BrowserId)
{
  if(window.BrowsersWithManualControl.indexOf(BrowserId) < 0)
    window.BrowsersWithManualControl.push(BrowserId)
  UpdateBrowsersIds()
}

function ManualControlStop(BrowserId)
{
  var index = window.BrowsersWithManualControl.indexOf(BrowserId) 
  if(index >= 0)
    window.BrowsersWithManualControl.splice(index, 1);
  UpdateBrowsersIds()
}

function InitPulse()
{
  window.PulseData = {
      labels: [],
      datasets: [{
          label: tr('Fail number'),
          backgroundColor: Chart.helpers.color(window.chartColors.red).alpha(0.5).rgbString(),
          borderColor: window.chartColors.red,
          borderWidth: 1,
          data: [

          ]
      }, {
          label: tr('Success number'),
          backgroundColor: Chart.helpers.color(window.chartColors.green).alpha(0.5).rgbString(),
          borderColor: window.chartColors.green,
          borderWidth: 1,
          data: [

          ]
      }]

  };

  window.Pulse = new Chart(document.getElementById('canvas').getContext('2d'), {
      type: 'bar',
      data: window.PulseData,
      options: {
          responsive: true,
          legend: null,
          maintainAspectRatio: false,
          title: {
              position: "left",
              display: true,
              fontStyle: "normal",
              text: tr("Successes and fails")
          },
          scales: {
        
              yAxes: [{
                  ticks: {
                      min: 0,
                      /*stepSize: 1,*/
                      callback: function(value, index, values) {
                        if (Math.floor(value) === value) {
                          return value;
                        }
                      }
                  }

              }]
          }
      }
  });

  let FormatPulseDate = function(Date)
  {
    let res = ""
    let add = Date.getHours().toString()
    if(add.length == 1)
    {
      add = "0" + add
    }
    res += add
    res += ":"
    add = Date.getMinutes().toString()
    if(add.length == 1)
    {
      add = "0" + add
    }
    res += add
    return res
  }

  let UpdatePulse = function() {
    let now = new Date()
    if (window.PulseData.labels.length == 0) {
        for (let i = 0; i < 10; i++) {
            let dateRelative = new Date(now - (i + 1) * 60 * 1000)
            window.PulseData.labels.push(FormatPulseDate(dateRelative))
            window.PulseData.datasets[0].data.push(0);
            window.PulseData.datasets[1].data.push(0);
        }
    }

    window.PulseData.labels.push(FormatPulseDate(now))
    window.PulseData.labels.shift()
    window.PulseData.datasets[0].data.push(0);
    window.PulseData.datasets[1].data.push(0);

    window.PulseData.datasets[0].data.shift()
    window.PulseData.datasets[1].data.shift()

    window.Pulse.update();

    setTimeout(function() {
        setTimeout(UpdatePulse, 0)
    }, (60 - now.getSeconds() + 5) * 1000)
  }

  Chart.plugins.register({
    afterDraw: function(chart) {
      if (chart.data.datasets.length === 0 || chart.data.datasets[0].data.reduce((accumulator, currentValue) => accumulator + currentValue, 0) + chart.data.datasets[1].data.reduce((accumulator, currentValue) => accumulator + currentValue, 0) == 0)
      {
        // No data is present
        var ctx = chart.chart.ctx;
        var width = chart.chart.width;
        var height = chart.chart.height
        chart.clear();
        
        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = "16px normal 'Helvetica Nueue'";
        ctx.fillText(tr('No success or fail executions during last ten minutes'), width / 2, height / 2);
        ctx.restore();
      }
    }
  });

  UpdatePulse()
}





function AddSuccessToPulse()
{
  window.PulseData.datasets[1].data[window.PulseData.datasets[1].data.length - 1]++;
  window.Pulse.update();
}

function AddFailsToPulse()
{
  window.PulseData.datasets[0].data[window.PulseData.datasets[0].data.length - 1]++;
  window.Pulse.update();
}

function ClearPulse()
{
  for(let i = 0;i<window.PulseData.datasets[0].data.length;i++)
  {
    window.PulseData.datasets[0].data[i] = 0;
    window.PulseData.datasets[1].data[i] = 0;  
  }
  
  window.Pulse.update();
}

function InitResourcesValidationAndVisibility()
{
     $(document).ready(function() {
          window.IsValid = true

          let CalculateVisibility = function()
          {
              $(".resource-not-visible").removeClass("resource-not-visible")
              $(".tab-not-visible").removeClass("tab-not-visible")

              let Changed = false

              while(true)
              {
                Changed = false
                $("[data-visibility-condition-variable]").each(function(index, elraw){
                  let el = $(elraw)
                  let resource = el.attr("data-visibility-condition-variable")
                  let v = el.attr("data-visibility-condition-value").split(/[|,;]/)
                  let model = $(`[data-resource-name="${resource}"]`)
                  if(model.hasClass("resource-not-visible"))
                  {
                    if(!el.hasClass("resource-not-visible"))
                      Changed = true
                    el.addClass("resource-not-visible")
                  }else if(model.length > 0)
                  {
                    let val = []
                    if(model.find("select").length > 0)
                    {
                      val = [model.find("select").val()]
                    }

                    if(model.find("input[type=radio]").length > 0)
                    {
                      val = [model.find("input[type=radio]:checked").val()]
                    }

                    if(model.find("input[type=checkbox]").length > 0)
                    {
                      let all = model.find("input[type=checkbox]:checked")
                      if(all.length > 0)
                      {
                        for(let i = 0;i<all.length;i++)
                        {
                          val.push($(all[i]).attr("value"))
                        }
                      }
                    }

                    let visible = false
                    for(let i = 0;i<v.length;i++)
                    {
                      for(let j = 0;j<val.length;j++)
                      {
                        if(val[j].indexOf(v[i]) >= 0)
                        {
                          visible = true
                          break
                        }
                      }
                      if(visible)
                      {
                        break
                      }
                    }
                    if(!visible)
                    {
                      if(!el.hasClass("resource-not-visible"))
                        Changed = true
                      el.addClass("resource-not-visible")
                    }


                  }

                })
                if(!Changed)
                  break
              }

              
              $("#ResourcesTabsHeader").children().each(function(index,elraw){
                let el = $(elraw)
                if($($("#ResourcesTabsContent").children()[index]).find("[data-resource-name]:not(.resource-not-visible)").length == 0)
                  el.addClass("tab-not-visible")
              })
          }
          let Validate = function()
          {
              window.IsValid = true
              $(".uk-form-danger").removeClass("uk-form-danger")
              $(".tab-not-valid").removeClass("tab-not-valid")
              let InvalidTabs = []
              let AddInvalidTab = function(el)
              {
                let index = parseInt($(el).attr("tab-index"))
                if(InvalidTabs.indexOf(index) < 0)
                  InvalidTabs.push(index)
              }
              $("[validation-database]").each(function(index, el){
                if($(el).val() == "0" && $(el).parents(".resource-not-visible").length == 0)
                {
                  $(el).addClass("uk-form-danger")
                  AddInvalidTab(el)
                }
              })
              $("[validation-not-empty]").each(function(index, el){
                if($(el).val().length == 0 && $(el).parents(".resource-not-visible").length == 0)
                {
                  $(el).addClass("uk-form-danger")
                  AddInvalidTab(el)
                }
              })
              $("[validation-url]").each(function(index, el){
                if($(el).val().length == 0 && $(el).parents(".resource-not-visible").length == 0)
                {
                  $(el).addClass("uk-form-danger")
                  AddInvalidTab(el)
                }
              })
              $("[validation-dir]").each(function(index, el){
                if($(el).val().length == 0 && $(el).parents(".resource-not-visible").length == 0)
                {
                  $(el).addClass("uk-form-danger")
                  AddInvalidTab(el)
                }
              })
              $("[validation-file]").each(function(index, el){
                if($(el).val().length == 0 && $(el).parents(".resource-not-visible").length == 0)
                {
                  $(el).addClass("uk-form-danger")
                  AddInvalidTab(el)
                }
              })
              InvalidTabs.forEach(function(TabIndex){
                window.IsValid = false
                $($("#ResourcesTabsHeader").children()[TabIndex]).addClass("tab-not-valid")
              })
          }

          let CalculateVisibilityAndValidate = function()
          {
            CalculateVisibility()
            Validate()
          }

          $("[validation-not-empty]").keyup(CalculateVisibilityAndValidate)
          $("[validation-url]").keyup(CalculateVisibilityAndValidate)
          $("[validation-dir]").keyup(CalculateVisibilityAndValidate)
          $("[validation-file]").keyup(CalculateVisibilityAndValidate)
          $("[validation-database]").keyup(CalculateVisibilityAndValidate)

          $("[validation-not-empty]").change(CalculateVisibilityAndValidate)
          $("[validation-url]").change(CalculateVisibilityAndValidate)
          $("[validation-dir]").change(CalculateVisibilityAndValidate)
          $("[validation-file]").change(CalculateVisibilityAndValidate)
          $("[validation-database]").change(CalculateVisibilityAndValidate)

          $("[data-is-visibility-factor=true] input").change(CalculateVisibilityAndValidate)
          $("[data-is-visibility-factor=true] select").change(CalculateVisibilityAndValidate)

          CalculateVisibilityAndValidate()
     })
     
}

function IsResourcesValid()
{
    return window.IsValid
}

function InitRandomStringModals()
{
     $(document).ready(function() {
          $(".random-string-dialog button").click(function(event){
               let target = event.currentTarget
               let edit = $(target).parent().find("input")

               let vocabulary = {}

               vocabulary["ELowVow"] = "{a|e|i|o|u}"
               vocabulary["EUpVow"] = "{A|E|I|O|U}"
               vocabulary["ELowCons"] = "{b|c|d|f|g|h|j|k|l|m|n|p|q|r|s|t|v|w|x|y|z}"
               vocabulary["EUpCons"] = "{B|C|D|F|G|H|J|K|L|M|N|P|Q|R|S|T|V|W|X|Y|Z}"
               vocabulary["EUp"] = "{<EUpVow>|<EUpCons>}"
               vocabulary["ELow"] = "{<ELowVow>|<ELowCons>}"
               vocabulary["EFemName"] = "{Mary|Jennifer|Lisa|Sandra|Michelle|Patricia|Maria|Nancy|Donna|Laura|Linda|Susan|Karen|Carol|Sarah|Barbara|Margaret|Betty|Ruth|Kimberly|Elizabeth|Dorothy|Helen|Sharon|Deborah}"
               vocabulary["EFemNameLow"] = "{mary|jennifer|lisa|sandra|michelle|patricia|maria|nancy|donna|laura|linda|susan|karen|carol|sarah|barbara|margaret|betty|ruth|kimberly|elizabeth|dorothy|helen|sharon|deborah}"
               vocabulary["EMaleName"] = "{James|David|Christopher|George|Ronald|John|Richard|Daniel|Kenneth|Anthony|Robert|Charles|Paul|Steven|Kevin|Michael|Joseph|Mark|Edward|Jason|William|Thomas|Donald|Brian|Jeff}"
               vocabulary["EMaleNameLow"] = "{james|david|christopher|george|ronald|john|richard|daniel|kenneth|anthony|robert|charles|paul|steven|kevin|michael|joseph|mark|edward|jason|william|thomas|donald|brian|jeff}"
               vocabulary["ESurname"] = "{Smith|Anderson|Clark|Wright|Mitchell|Johnson|Thomas|Rodriguez|Lopez|Perez|Williams|Jackson|Lewis|Hill|Roberts|Jones|White|Lee|Scott|Turner|Brown|Harris|Walker|Green|Phillips|Davis|Martin|Hall|Adams|Campbell|Miller|Thompson|Allen|Baker|Parker|Wilson|Garcia|Young|Gonzalez|Evans|Moore|Martinez|Hernandez|Nelson|Edwards|Taylor|Robinson|King|Carter|Collins}"
               vocabulary["ESurnameLow"] = "{smith|anderson|clark|wright|mitchell|johnson|thomas|rodriguez|lopez|perez|williams|jackson|lewis|hill|roberts|jones|white|lee|scott|turner|brown|harris|walker|green|phillips|davis|martin|hall|adams|campbell|miller|thompson|allen|baker|parker|wilson|garcia|young|gonzalez|evans|moore|martinez|hernandez|nelson|edwards|taylor|robinson|king|carter|collins}"



                let dialog = UIkit.modal.dialog(`<div class="uk-modal-body uk-modal-dialog-large">
        <h2 class="uk-modal-title">String generator</h2>

          

               <div style="display: flex;">
                    <input type="text" placeholder="String template" class="uk-input ui-internal string-generator-input"  style="justify-content: flex-start;" >
                    <button class="uk-button uk-button-default ui-internal string-generator-test" style="min-width: 150px;">Test</button>
               </div>

               <div uk-overflow-auto style="margin-top:10px" >
                    
                    <div style="display: flex;margin-bottom:10px;">
                         <button class="uk-button uk-button-default ui-internal ui-add-template" style="min-width: 150px;">AnyLetter</button>
                         <input type="text" placeholder="String template" class="uk-input ui-internal"  style="justify-content: flex-start;" value="Any letter" disabled />
                    </div>

                    <div style="display: flex;margin-bottom:10px;">
                         <button class="uk-button uk-button-default ui-internal ui-add-template" style="min-width: 150px;">AnyDigit</button>
                         <input type="text" placeholder="String template" class="uk-input ui-internal"  style="justify-content: flex-start;" value="Any digit" disabled />
                    </div>

                    <div style="display: flex;margin-bottom:10px;">
                         <button class="uk-button uk-button-default ui-internal ui-add-template" style="min-width: 150px;">{B1|B2|B3}</button>
                         <input type="text" placeholder="String template" class="uk-input ui-internal"  style="justify-content: flex-start;" value="Any of options" disabled />
                    </div>

                    ${Object.keys(vocabulary).map(function(key){
                         let value = vocabulary[key]
                         return `<div style="display: flex;margin-bottom:10px;">
                                        <button class="uk-button uk-button-default ui-internal ui-add-template" style="min-width: 150px;">${key}</button>
                                        <input type="text" placeholder="String template" class="uk-input ui-internal"  style="justify-content: flex-start;" value="${value}" disabled />
                                   </div>`

                    }).join("")}
                   

               </div>

               <div style="margin-bottom:5px; margin-top:5px">Results: </div>
               <textarea class="uk-textarea" rows="5" placeholder="Results" style="margin-bottom:10px"></textarea>

               <div class="uk-modal-footer uk-text-right" style="padding-right:0px; padding-top:0px; border-top:0px">
                 <button class="uk-button uk-button-default uk-modal-close" type="button">Cancel</button>
                 <button class="uk-button uk-button-primary ui-save" type="button">Save</button>
               </div>
    </div>`);
               let el = $(dialog.$el)
               el.find(".uk-modal-dialog").css("width","90%")
               el.find(".string-generator-input").val(edit.val())
               el.find(".ui-add-template").click(function(event){
                    let target = $(event.target)
                    let input = el.find(".string-generator-input")
                    let template = target.text()
                    if(target.text().indexOf("{") != 0)
                         template = "<" + template + ">"

                    var cursorPos = input.prop('selectionStart');
                    var v = input.val();
                    var textBefore = v.substring(0,  cursorPos);
                    var textAfter  = v.substring(cursorPos, v.length);

                    input.val(textBefore + template + textAfter);

               })

               $(".ui-save").click(function(){
                    edit.val(el.find(".string-generator-input").val())
                    dialog.hide()
               })

               $(".string-generator-test").click(function(){
                    let str = el.find(".string-generator-input").val()
                    let resTextarea = []


                    let replaceByIndex = function(string, index, size, replace)
                    {
                      return string.substring(0, index) + replace + string.substring(index + size);
                    }

                    for(let iter = 0;iter<10;iter++)
                    {
                         let res = str;
                         let j = 0;
                         let i = 0;
                         while(true)
                         {
                           i++;
                           let no_activity = true;
                           while ((j = res.indexOf("<AnyLetter>")) >= 0)
                           {
                               no_activity = false;
                               let char = ""
                               var possible = "abcdefghijklmnopqrstuvwxyz";
                               char += possible.charAt(Math.floor(Math.random() * possible.length));
                               
                               res = replaceByIndex(res,j,11,char);
                           }
                           while ((j = res.indexOf("<AnyDigit>")) != -1)
                           {
                               no_activity = false;
                               let char = ""
                               var possible = "0123456789";
                               char += possible.charAt(Math.floor(Math.random() * possible.length));
                               
                               res = replaceByIndex(res,j,10,char);
                           }

                           while(true)
                           {
                               j = res.match(/\{([^\}\{]+)\}/);

                               if(j == null)
                                   break;
                               no_activity = false;
                               let list = j[1].split("|");
                               let r = list[Math.floor(Math.random() * list.length)];

                               res = replaceByIndex(res,j.index,j[0].length,r);
                           }

                           Object.keys(vocabulary).forEach(function(key){
                              let value = vocabulary[key]
                              if(res.indexOf(key) >= 0)
                              {
                                   no_activity = false;
                                   res = res.replace(new RegExp("\\<" + key + "\\>", 'g'), value);
                              }
                         
                           })
                           
                         if(no_activity || i>100)
                               break;
                         }



                         resTextarea.push(res)
                    }
                    el.find("textarea").val(resTextarea.join("\r\n"))
               })


               dialog.bgClose = false
               dialog.escClose = false

               
          })
     });
     
}

