class Floor < ActiveRecord::Base
  belongs_to :building
  has_many :rooms, :dependent => :destroy
  accepts_nested_attributes_for :rooms, :allow_destroy => true


  has_attached_file :image,:styles => { :thumb => "200x200#" }
  validates_attachment :image, content_type: { content_type:     ["image/jpg", "image/jpeg", "image/png"] }
  before_save :extract_dimensions
  serialize :image_dimensions


  # def img?
  #   @upload_content_type =~ %r{^(image|(x-)?application)/(bmp|gif|jpeg|jpg|pjpeg|png|x-png)$}
  # end

  def to_builder
    Jbuilder.new do |b|
      b.(self, :name, :id, :image, :map_scale_x1, :map_scale_y1, :map_scale_x2, :map_scale_y2, :map_scale_length, :image_dimensions)
      b.url "/floors/" + self.id.to_s
      b.rooms self.rooms.collect { |b| b.to_builder.attributes! }
    end
  end


  def extract_dimensions
    tempfile = image.queued_for_write[:original]
    unless tempfile.nil?
      geometry = Paperclip::Geometry.from_file(tempfile)
      self.image_dimensions = { :w => geometry.width.to_i,  :h => geometry.height.to_i}.to_json
    end
  end

end
