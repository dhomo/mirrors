var MangaFox = {
  mirrorName: "Manga-Fox",
  canListFullMangas: false,
  mirrorIcon: "img/mangafox.png",
  languages: "en",

  isMe: function (url) {
    return (url.indexOf("mangafox") !== -1);
  },

  getMangaList: function (search, callback) {
    var urlManga = "http://mangafox.me/search.php?name=" + search + "&advopts=1";

    $.ajax({
      url: urlManga,

      beforeSend: function (xhr) {
        xhr.setRequestHeader("Cache-Control", "no-cache");
        xhr.setRequestHeader("Pragma", "no-cache");
      },

      success: function (objResponse) {
        var div = document.createElement("div");
        div.innerHTML = objResponse;

        if (objResponse.indexOf("No Manga Series") !== -1) {
          callback("Manga-Fox", []);
        }
        else {
          var res = $(div)
            .find("#listing tr td:first-child a")
            .map(function () {
              var $this = $(this);

              return [$this.html(), $this.attr("href")];
            })
            .get();

          callback("Manga-Fox", res);
        }
      }
    });
  },

  getListChaps: function (urlManga, mangaName, obj, callback) {
    $.ajax({
      url: urlManga + "?no_warning=1",

      beforeSend: function (xhr) {
        xhr.setRequestHeader("Cache-Control", "no-cache");
        xhr.setRequestHeader("Pragma", "no-cache");
      },

      success: function (objResponse) {
        var div = document.createElement("div");
        div.innerHTML = objResponse;

        var $div = $(div);

        var title = $div.find("#title h2").text();

        var mangaName = title.substr(5, title.length - 18);

        var res = $div
          .find("ul.chlist h3, ul.chlist h4")
          .map(function () {
            var $this = $(this);
            var $a = $this.find("a");
            var href = $a.attr("href");

            if (href.indexOf("/manga/") !== -1) {
              var vol = $this
                .parents("ul.chlist")
                .prev("div.slide")
                .children("h3")
                .contents(":not(span)")
                .text()
                .trim()
                .substr(7);

              var tit = "Vol " + vol + " Ch " + $a.text().substr(mangaName.length + 1) + ": " + $this.find("span.title").text();
              var curChapURL = href.substr(0, href.lastIndexOf("/") + 1);
              var length = curChapURL.length;

              if (curChapURL.substr(length - 2, 2) === "// ") {
                curChapURL = curChapURL.substr(0, length - 1);
              }

              return [tit.trim(), curChapURL];
            }
          })
          .get();

        callback(res, obj);
      }
    });
  },

  getInformationsFromCurrentPage: function (doc, curUrl, callback) {
    var $doc = $(doc);
    var str = $doc.find("#series > strong a").text();// dom lookups are expensive!
    var name = $doc.find("#related > h3 a").text() || str.substring(0, str.length - 6); // falls through #related, into #series
    var currentChapter = $doc.find("#series h1").text();
    var url = curUrl;
    var posSl5 = 0;
    var i;

    for (i = 0; i < 5; i += 1) {
      posSl5 = url.indexOf("/", posSl5 + 1);
    }

    var curChapURL = url.substr(0, url.lastIndexOf("/") + 1);

    if (curChapURL.substr(curChapURL.length - 2, 2) === "// ") {
      curChapURL = curChapURL.substr(0, curChapURL.length - 1);
    }

    callback({
      name: name,
      currentChapter: currentChapter.trim(),
      currentMangaURL: url.substr(0, posSl5 + 1),
      currentChapterURL: curChapURL
    });
  },

  getListImages: function (doc, curUrl) {
    return $(doc)
      .find("#top_bar select.m option")
      .filter(function () {
        return this.value > 0;
      })
      .map(function () {
        return curUrl.substr(0, curUrl.lastIndexOf("/") + 1) + this.value + ".html";
      })
      .get();
  },

  removeBanners: function (doc, curUrl) {
    $(doc)
      .find("#bottom_ads, #MarketGid9463, .ad, #banner")
      .remove();
  },

  whereDoIWriteScans: function (doc, curUrl) {
    return $(doc).find("#viewer");
  },

  whereDoIWriteNavigation: function (doc, curUrl) {
    return $(doc).find(".navAMR");
  },

  isCurrentPageAChapterPage: function (doc, curUrl) {
    var $viewer = $(doc).find("#viewer");

    if ($viewer !== null) {
      return $viewer.length !== 0;
    }

    return false;
  },

  doSomethingBeforeWritingScans: function (doc, curUrl) {
    var $doc = $(doc);
    var $viewer = $doc.find("#viewer");

    $viewer
      .css({
        width: "auto",
        margin: "auto",
        "background-color": "black"
      })
      .after("<div class='navAMR'></div>")
      .before("<div class='navAMR'></div>");

    $doc
      .find("#image")
      .remove();

    $doc
      .find("#tool")
      .next()
      .remove();

    $(".widepage").css("display", "none"); // have to still have this for the series name.

    $doc
      .find(".fb_iframe_widget")
      .remove();

    if (typeof doc.createElement === "function") {
      var script = doc.createElement("script");
      script.innerText = "$(document).unbind('keydown');";
      doc.body.appendChild(script);
    }
  },

  nextChapterUrl: function (select, doc, curUrl) {
    var selected = $(select).children("option:selected");

    if (selected.prev().length !== 0) {
      return selected.prev().val();
    }
    return null;
  },

  previousChapterUrl: function (select, doc, curUrl) {
    var $selected = $(select).children("option:selected");

    if ($selected.length !== 0) {
      return $selected.val();
    }
    return null;
  },

  getImageFromPageAndWrite: function (urlImg, image, doc, curUrl) {
    $.ajax({
      url: urlImg,

      success: function (objResponse) {
        var div = document.createElement("div");
        div.innerHTML = objResponse;

        var src = $(div)
          .find("meta[property=\"og:image\"]")
          .attr("content")
          .replace("thumbnails/mini.", "compressed/");

        $(image).attr("src", src);
      }
    });
  },

  isImageInOneCol: function (img, doc, curUrl) {
    return false;
  },

  getMangaSelectFromPage: function (doc, curUrl) {
    return null;
  },

  doAfterMangaLoaded: function (doc, curUrl) {
    $(doc).find("body > div:empty").remove();
  }
};

// Call registerMangaObject to be known by includer
if (typeof registerMangaObject === "function") {
	registerMangaObject("Manga-Fox", MangaFox);
}
