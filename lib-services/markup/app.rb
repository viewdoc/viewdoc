require 'roda'
require 'github/markup'
require 'html/pipeline'

$pipeline = HTML::Pipeline.new [
  HTML::Pipeline::SanitizationFilter,
  HTML::Pipeline::TableOfContentsFilter,
  HTML::Pipeline::EmojiFilter,
], {
  :asset_root => 'https://github.githubassets.com/images/icons',
  :anchor_icon => '<span aria-hidden="true">#</span>',
}

class App < Roda
  plugin :json

  route do |r|
    r.post String do |format|
      $pipeline.call(
        GitHub::Markup.render('markup.' + format, request.body.read.force_encoding('utf-8'))
      )
    end
  end
end
