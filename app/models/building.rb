class Building < ActiveRecord::Base
  belongs_to :company
  has_many :floors
  accepts_nested_attributes_for :floors, :allow_destroy => true


  has_many :admin_user_role_to_buildings
  has_many :admin_user_roles, :through => :admin_user_role_to_buildings
  accepts_nested_attributes_for :admin_user_role_to_buildings, :allow_destroy => true
  accepts_nested_attributes_for :admin_user_roles, :allow_destroy => true

  def url
    "/buildings/%d" % self.id
  end


  default_scope {order(:name)}
  scope :arm_scope, where(id:5).order(:name)
end
