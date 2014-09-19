ActiveAdmin.register Room do

  # See permitted parameters documentation:
  # https://github.com/gregbell/active_admin/blob/master/docs/2-resource-customization.md#setting-up-strong-parameters
  #
  # permit_params :list, :of, :attributes, :on, :model
  #
  # or
  #
  # permit_params do
  #  permitted = [:permitted, :attributes]
  #  permitted << :other if resource.something?
  #  permitted
  # end
  #

  show do |c|
    attributes_table do
      row "Visualiser" do link_to("Ouvrir", room_path(c.id), {}) end
      row "Etage" do link_to c.floor.fullname, admin_floor_path(c.floor.id), {} end
      row "Nom" do c.name end
      row "Type" do c.room_type end
      row "Organisation" do c.organization end
      row "Aire" do c.area.to_s + ' m²' end
      row "Périmètre" do c.perimeter end
      row "Nature des sols" do c.room_ground_type end
      row "Zone d'évacuation" do c.evacuation_zone end
      row "Ports Réseau" do c.network end
      row I18n.t('formtastic.labels.room.free_desk_number') do c.free_desk_number end
    end


    panel "Affectations" do
      table_for room.affectations do
        column "Personnes" do |b|
          if !b.person.nil?
            link_to b.person.fullname, admin_person_url(b.person.id)
          end
        end
      end
    end

    panel "Inventaire" do
      table_for room.inventories do
        column "Item" do |b|
          if !b.item.nil?
            link_to b.item.name, admin_item_url(b.item.id)
          end
        end
        column "Code" do |b|
          if !b.item.nil?
            b.item.code
          end
        end
        column "Quantité" do |b| b.quantity end
      end
    end


  end


  index do
    selectable_column
    id_column
    column "Etage", :floor
    column "Nom", :name
    column "Type", :room_type
    column "Organisation", :organization
    column "Nature des sol", :room_ground_type
    column "Aire", :area
    column "Périmètre", :perimeter
    actions
  end

  form do |f|
    f.inputs "Details" do
      f.input :id, label: "Visualiser", input_html: { class: 'room-link' }
      f.input :floor, label: "Etage", :as => :select, :collection => Floor.all.map {|f| [f.fullname, f.id]}, :include_blank => false
      f.input :name
      f.input :room_type, label: "Type"
      f.input :organization, label: "Organisation"
      f.input :room_ground_type, label: "Nature des sol"
      f.input :evacuation_zone, label: "Zone d'évacuation"
      f.input :free_desk_number
      f.input :network, label: "Ports Réseau"      
    end

    f.has_many :affectations do |app_f|
      if !app_f.object.nil?
        app_f.input :_destroy, :as => :boolean, :label => "Retirer l'affectation"
      end
      app_f.input :person, label: "Nom", as: :select, :collection => Person.all.map{|u| [u.fullname, u.id]}
    end

    f.has_many :inventories do |app_f|
      if !app_f.object.nil?
        app_f.input :_destroy, :as => :boolean, :label => "Retirer l'item"
      end
      app_f.input :item, label: "Nom", as: :select, :collection => Item.all.map{|u| ["#{u.name}", u.id]}
      app_f.input :quantity, label: "Quantité"
    end


    # f.has_many :people do |b|
    #   b.inputs "Affectations" do
    #     if !b.object.nil?
    #       b.input :firstname
    #       b.input :lastname
    #     end
    #     b.actions
    #   end
    # end

    # f.inputs "Géométrie" do
    #   f.input :points, label: "Points"
    # end

    f.actions
  end



  controller do
    def permitted_params
      params.permit!
    end
  end
end
