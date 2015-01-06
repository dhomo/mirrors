var GoodManga = {
  mirrorName : 'GoodManga',
  canListFullMangas : false,
  mirrorIcon : 'img/goodmanga.png',
  languages : 'en',

  isMe : function (url) {
    return url.indexOf('www.goodmanga.net/') !== -1;
  },

  getMangaList : function (search, callback) {
    $.ajax({
      url : 'http://www.goodmanga.net/manga-search?key=' + search + '&search=Go' + '',

      beforeSend : function (xhr) {
        xhr.setRequestHeader('Cache-Control', 'no-cache');
        xhr.setRequestHeader('Pragma', 'no-cache');
      },

      success : function (data) {
        var div = document.createElement('div');
        div.innerHTML = data.replace(/<img/gi, '<noload');

        var res = $(div)
          .find('.series_list .right_col h3 a:first-child')
          .map(function () {
            var $this = $(this);

            return [$this.text().trim(), $this.attr('href')];
          })
          .get();

        callback('GoodManga', res);
      }
    });
  },

  getListChaps : function (urlManga, mangaName, obj, callback) {
    $.ajax({
      url : urlManga,

      beforeSend : function (xhr) {
        xhr.setRequestHeader('Cache-Control', 'no-cache');
        xhr.setRequestHeader('Pragma', 'no-cache');
      },

      success : function (objResponse) {
        var div = document.createElement('div');
        div.innerHTML = objResponse.replace(/<img/gi, '<noload');

        var res = [];

        $('#chapters ul li a', div).each(function (index) {
          var $this = $(this);
          res[res.length] = [$this.text().trim(), $this.attr('href')];
        });

        callback(res, obj);
      }
    });
  },

  getInformationsFromCurrentPage : function (doc, curUrl, callback) {
    var $doc = $(doc);
    var name = $doc.find('#content #manga_head h1 a').text();
    var nameurl = $doc.find('#content #manga_head h1 a').attr('href');
    var curChapName = $doc.find('select.chapter_select:first option:selected').text();
    var chapurl = $doc.find('#page #content #assets #asset_1 select.chapter_select:first option:selected').val();

    callback({
      name: name,
      currentChapter: curChapName,
      currentMangaURL: nameurl,
      currentChapterURL: chapurl
    });
  },

  getListImages : function (doc, curUrl2) {
    return $(doc)
      .find('#page #content #assets #asset_2 select.page_select:first option')
      .map(function (index) {
        return $(this).val();
      })
      .get();
  },

  removeBanners : function (doc, curUrl) {
    $(doc)
      .find('#mv_ad_top, #mv_ad_bottom')
      .remove();
  },

  whereDoIWriteScans : function (doc, curUrl) {
    return $(doc).find('#manga_viewer');
  },

  whereDoIWriteNavigation : function (doc, curUrl) {
    return $(doc).find('.navAMR');
  },

  isCurrentPageAChapterPage : function (doc, curUrl) {
    return $(doc).find('div#content div#manga_viewer img').length > 0;
  },

  doSomethingBeforeWritingScans : function (doc, curUrl) {
    var $doc = $(doc);

    $doc
      .find('#manga_nav_top, #manga_nav_bottom')
      .remove();

    $doc
      .find('#manga_viewer')
      .empty()
      .before('<div class=\'navAMR\'></div>')
      .after('<div class=\'navAMR\'></div>');

    $doc
      .find('.navAMR')
      .css('text-align', 'center');

    $doc
      .find('#content')
      .css('background-color', 'black');

    $doc
      .find('#manga_viewer')
      .css('padding-top', '10px');
  },

  nextChapterUrl : function (select, doc, curUrl) {
    var selected = $(select).find('option:selected').next();

    if (selected.length !== 0) {
      return selected.val();
    }

    return null;
  },

  previousChapterUrl : function (select, doc, curUrl) {
    var selected = $(select).find('option:selected').prev();

    if (selected.length !== 0) {
      return selected.val();
    }

    return null;
  },

  getImageFromPageAndWrite : function (urlImg, image, doc, curUrl) {
    $.ajax({
      url : urlImg,

      success : function (objResponse) {
        var div = document.createElement('div');
        div.innerHTML = objResponse;

        var src = $(div).find('#manga_viewer img').attr('src');
        $(image).attr('src', src);
      }
    });
  },

  isImageInOneCol : function (img, doc, curUrl) {
    return false;
  },

  getMangaSelectFromPage : function (doc, curUrl) {
    var $doc = $(doc);

    $doc.find('select#bottom_chapter_list:first option').each(function (index) {
      var $this = $(this);

      $this.val('http://www.goodmanga.net' + $this.val());
    });

    return $doc.find('select.chapter_select:first');
  },

  doAfterMangaLoaded : function (doc, curUrl) {
    $('body > div:empty', doc).remove();
  }
};

// Call registerMangaObject to be known by includer
if (typeof registerMangaObject == 'function') {
  registerMangaObject('GoodManga', GoodManga);
}
