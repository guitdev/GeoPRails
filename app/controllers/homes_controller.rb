class HomesController < GeopController
  def search
    @q = params[:q].downcase
    @search = "%#{@q}%"
    @resArray = []


    people = Person.where(["lower(firstname) like ? OR lower(lastname) like ?", @search, @search]).map { |b| b.as_json(:methods => [:fullname, :url]) }
    rooms = Room.includes(:floor => :building).where(["lower(name) like ?", @search]).map { |b| b.as_json(:methods => [:fullname, :url, :url_with_floor])}
    floors = Floor.includes(:building).where(["lower(name) like ?", @search]).map { |b| b.as_json(:methods => [:fullname, :url])}
    organizations = Organization.where(["lower(name) like ?", @search]).map { |b| b.as_json(:methods => [:fullname, :url])}

    @res = {
      "rooms" => rooms,
      "people" => people,
      "floors" => floors,
      "organizations" => organizations,
      "length" => rooms.count + people.count + floors.count + organizations.count
    }
    render json: @res
  end

  def show
  end

  def clear_cache
    puts 'The cache has been clear'
    Rails.cache.clear(nil)
    render json: "ok"
  end
end
