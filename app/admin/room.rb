ActiveAdmin.register Room do
  menu :label => "Pièces"

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
      row "Etage" do c.floor end
      row "Nom" do c.name end
      row "Type" do c.room_type end
      row "Organisation" do c.organization end
      row "Aire" do c.area.to_s + ' m²' end
      row "Nature des sols" do c.room_ground_type end
    end


    panel "Affectations" do
      table_for room.affectations do
        column "Personnes" do |b| link_to b.person.firstname + ' ' + b.person.lastname, admin_person_url(b.person.id) end
        # column "Personnes" do |b| link_to b.person.firstname + ' ' + b.person.lastname, admin_person_url(b.person.id) end
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
    actions
  end

  form do |f|
    f.inputs "Details" do
      f.input :id, label: "Visualiser", input_html: { class: 'room-link' }
      f.input :floor, label: "Etage"
      f.input :name , label: "Nom"
      f.input :room_type, label: "Type"
      f.input :organization, label: "Organisation"
      f.input :room_ground_type, label: "Nature des sol"

    end

    f.has_many :affectations do |app_f|
      # app_f.inputs "Affectations" do
        if !app_f.object.nil?
          # show the destroy checkbox only if it is an existing appointment
          # else, there's already dynamic JS to add / remove new appointments
          app_f.input :_destroy, :as => :boolean, :label => "Retirer l'affectation"
        end
        app_f.input :person, label: "Nom", as: :select, :collection => Person.all.map{|u| ["#{u.firstname} #{u.lastname}", u.id]}

        # app_f.input :person # it should automatically generate a drop-down select to choose from your existing patients
        # app_f.input :appointment_date
      # end
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
