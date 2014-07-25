class Person < ActiveRecord::Base
  belongs_to :room
  belongs_to :person_state
  belongs_to :organization


  has_many :affectations
  has_many :rooms, :through => :affectations
  accepts_nested_attributes_for :rooms, :allow_destroy => true
  accepts_nested_attributes_for :affectations, :allow_destroy => true

  def fullname
    self.firstname + ' ' + self.lastname
  end

  def format_phone (a)
    a.gsub(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '\1 \2 \3 \4 \5')
  end

  def format_telephone
    format_phone self.telephone
  end

  def format_cellphone
    format_phone self.cellphone
  end



  def to_builder
    Jbuilder.new do |b|
      b.(self, :firstname, :lastname, :id, :telephone, :cellphone, :person_state, :computerreference, :monitorreference, :room, :organization, :fullname, :format_telephone, :format_cellphone)
      # b.url person_url(self.id) 
      b.affectations self.affectations.collect { |b| b.to_builder_room.attributes! }
    end
  end


end
