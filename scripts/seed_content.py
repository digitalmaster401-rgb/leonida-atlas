# Script de siembra reproducible usado el 2026-11-22 para generar content/entries.json
# a partir de la investigación documentada en sources/. Desde entonces, content/entries.json
# es la fuente de verdad (editable a mano o con el panel /editor). Ejecutar: python3 scripts/seed_content.py
V="2026-11-22"
PATCH="Lanzamiento (19-nov-2026). La fuente no indica número de parche."
OFFPATCH="Contenido oficial de lanzamiento (19-nov-2026)."
def F(label,value,status,*src): return dict(label=label,value=value,status=status,sources=list(src))
def P(x,y,precision,basis): return dict(x=x,y=y,precision=precision,basis=basis)
MAPB="Rótulo visible en el mapa oficial de Leonida (póster de Rockstar Games)."
E=[]
def add(**k):
    d=dict(subzone=None,howTo=[],requirements=[],chapter=None,mode="historia",platform=["PS5","Xbox Series X|S"],patch=OFFPATCH,
           reward=None,time=None,risks=[],images=[],mapPosition=None,spoilerLevel=0,edition="base",tags=[],related=[],money=None,facts=[],verifiedAt=V)
    d.update(k); E.append(d)

# ---------------- LUGARES (regiones oficiales)
add(id="lug-vice-city",slug="vice-city",name="Vice City",category="lugares",region="vice-city",status="oficial",
 summary="La gran ciudad de Leonida: playas, art déco, vida nocturna y el puerto de cruceros.",
 description="Rockstar la presenta como «la capital del sol y la diversión de Estados Unidos»: glamour, ajetreo y ambición en una sola ciudad. La descripción oficial menciona los hoteles art déco en tonos pastel y la arena blanca de Ocean Beach, las panaderías de Little Cuba, las marcas piratas del mercado de pulgas Tisha-Wocka y el VC Port, «la capital mundial de los cruceros».",
 howTo=["Abre el mapa de LEONIDA ATLAS y toca el punto «Vice City» para ver su ubicación en el mapa oficial.","Explora las subzonas con ficha propia: Ocean Beach, Little Cuba, Stockyard y Washington Beach."],
 facts=[F("Tipo","Ciudad principal del estado de Leonida","oficial","rs-oil"),F("Barrios mencionados oficialmente","Ocean Beach, Little Cuba, mercado Tisha-Wocka, VC Port","oficial","rs-oil"),F("Condado en el mapa oficial","Vice-Dale County","oficial","rs-map")],
 sources=["rs-oil","rs-map","rs-gallery"],images=["vc-skyline-noche","vc-puente-levadizo","vc-playa","vc-marina","vc-letrero","vc-calles","vc-hotel-alberca"],
 mapPosition=P(0.668,0.52,"region",MAPB),tags=["ciudad","playa","vida nocturna","miami"])
add(id="lug-leonida-keys",slug="leonida-keys",name="Leonida Keys",category="lugares",region="leonida-keys",status="oficial",
 summary="Archipiélago tropical: bares relajados y aguas tan bellas como peligrosas.",
 description="«Puerta al paraíso». Según Rockstar, la vida en este archipiélago tropical no es ostentosa pero sí fácil: el código de vestir es casual y los bares están llenos, aunque estás a las puertas de algunas de las aguas más hermosas y peligrosas de Estados Unidos. Aquí trabajaba Jason para narcotraficantes locales y aquí opera Brian Heder.",
 howTo=["En el mapa oficial, la cadena de cayos va de Key Lento hacia Southwind y Mile Zero Air Station siguiendo la ruta 1A.","Consulta la ruta orientativa «Por la 1A hasta Mile Zero» en Rutas y tutoriales."],
 facts=[F("Tipo","Archipiélago tropical","oficial","rs-oil"),F("Lugares rotulados en el mapa","Key Lento, Southwind, Mile Zero Air Station, Permit Keys, Riquezas Keys","oficial","rs-map")],
 sources=["rs-oil","rs-map"],images=["keys-hidroavion","keys-bar","keys-buceo","keys-pez-leon","keys-iguana"],
 mapPosition=P(0.568,0.833,"region","Punto colocado sobre el rótulo «Key Lento» del mapa oficial; la región abarca toda la cadena de cayos del sur."),tags=["islas","buceo","bares","cayos"])
add(id="lug-grassrivers",slug="grassrivers",name="Grassrivers",category="lugares",region="grassrivers",status="oficial",
 summary="Humedales salvajes: caimanes, manglares y depredadores aún más peligrosos.",
 description="«Bienvenido a los humedales»: la joya indomable de la corona de Leonida. Rockstar advierte que nunca sabes qué hay bajo la superficie de esta extensión primigenia; los caimanes son la atracción más famosa, pero entre los manglares hay depredadores más letales y descubrimientos extraños.",
 facts=[F("Tipo","Humedales y manglares","oficial","rs-oil"),F("Fauna mostrada oficialmente","Caimanes; en capturas oficiales aparecen aerodeslizadores","oficial","rs-oil","rs-gallery")],
 risks=["Fauna agresiva (caimanes) según el material oficial."],
 sources=["rs-oil","rs-map","rs-gallery"],images=["gr-aerodeslizador","gr-pantano-noche","gr-persecucion"],
 mapPosition=P(0.45,0.662,"region",MAPB),tags=["pantano","caimanes","everglades","aerodeslizador"])
add(id="lug-port-gellhorn",slug="port-gellhorn",name="Port Gellhorn",category="lugares",region="port-gellhorn",status="oficial",
 summary="La costa olvidada de Leonida: moteles baratos, plazas vacías y motos de terracería.",
 description="«Vive duro». Rockstar la describe como la costa olvidada del estado: moteles baratos, atracciones cerradas y centros comerciales vacíos que no traerán de vuelta a los turistas, aunque hay una nueva economía alimentada por licor de malta, analgésicos y bebidas energéticas de parador.",
 facts=[F("Tipo","Antiguo destino vacacional en decadencia","oficial","rs-oil"),F("Ubicación","Costa oeste, sobre Kelly County en el mapa oficial","oficial","rs-map")],
 sources=["rs-oil","rs-map"],images=["pg-motel","pg-club","pg-fogata"],
 mapPosition=P(0.305,0.358,"region",MAPB),tags=["costa","moteles","golfo"])
add(id="lug-ambrosia",slug="ambrosia",name="Ambrosia",category="lugares",region="ambrosia",status="oficial",
 summary="Corazón industrial de Leonida: la refinería Allied Crystal y una pandilla de motociclistas.",
 description="«La batalla por la salud y la riqueza de Leonida empieza aquí». En el corazón del estado, la industria estadounidense y los valores de la vieja escuela siguen mandando, cueste lo que cueste. La refinería de azúcar Allied Crystal da los empleos; la pandilla local de motociclistas, casi todo lo demás.",
 facts=[F("Empleador principal","Refinería de azúcar Allied Crystal","oficial","rs-oil"),F("Ubicación","Junto a Lake Leonida, Leonard County (mapa oficial)","oficial","rs-map")],
 sources=["rs-oil","rs-map"],images=["amb-skyline","amb-cultivos","amb-bikers"],
 mapPosition=P(0.555,0.356,"region",MAPB),tags=["industria","azucar","bikers","lago"])
add(id="lug-mount-kalaga",slug="mount-kalaga",name="Mount Kalaga National Park",category="lugares",region="mount-kalaga",status="oficial",
 summary="Parque nacional en la frontera norte: caza, pesca y senderos todoterreno.",
 description="«Tierra salvaje». Un monumento nacional pegado a la frontera norte del estado, con caza, pesca y senderos todoterreno de primera. En los bosques que lo rodean viven místicos montañeses y radicales paranoicos, lejos de la mirada del gobierno.",
 facts=[F("Actividades mencionadas oficialmente","Caza, pesca y senderos todoterreno","oficial","rs-oil"),F("Condado","Lummox County (mapa oficial)","oficial","rs-map")],
 sources=["rs-oil","rs-map"],images=["mk-carretera","mk-kayak","mk-puma","mk-dirtbikes"],
 mapPosition=P(0.5,0.226,"region",MAPB),tags=["bosque","caza","pesca","offroad"])
# subzonas oficiales
SUB=[
 ("ocean-beach","Ocean Beach","vice-city","Hoteles art déco en tonos pastel y arena blanca.","Rockstar destaca los hoteles art déco pastel y la arena blanca de Ocean Beach. Junto a esta playa está el garaje Shore Court del Vintage Vice City Pack.",P(0.862,0.5225,"barrio",MAPB),["lug-vice-city","neg-shore-court"]),
 ("little-cuba","Little Cuba","vice-city","Barrio de Vice City conocido por sus panaderías.","La descripción oficial de Vice City menciona «las concurridas panaderías de Little Cuba».",P(0.661,0.533,"barrio",MAPB),["lug-vice-city"]),
 ("stockyard","Stockyard","vice-city","Zona de Vice City con la tienda Stock 305 y Electric Fang Tattoo.","Rockstar sitúa en Stockyard la tienda de streetwear Stock 305 y el estudio Electric Fang Tattoo (ambos exclusivos de Ultimate Edition).",P(0.724,0.4497,"barrio",MAPB),["neg-stock-305","neg-electric-fang"]),
 ("washington-beach","Washington Beach","vice-city","Playa donde está atracado el Shitzu Squalo de Ultimate Edition.","Según la descripción oficial del Shitzu Squalo, la lancha está atracada en Washington Beach.",P(0.865,0.4445,"barrio",MAPB),["veh-shitzu-squalo"]),
 ("watson-bay","Watson Bay","grassrivers","Bahía donde está el Paradise Garage.","El ’67 Vapid Dominator Buggy se guarda en el Paradise Garage de Watson Bay, según Rockstar.",P(0.432,0.703,"barrio",MAPB),["neg-paradise-garage"]),
 ("lake-leonida","Lake Leonida","ambrosia","Lago central donde está el taller One-Eyed Willie's.","Rockstar ubica el taller de modificaciones todoterreno One-Eyed Willie's en Lake Leonida.",P(0.608,0.314,"zona",MAPB),["neg-one-eyed-willies"]),
]
for slug,name,reg,summ,desc,pos,rel in SUB:
    add(id="lug-"+slug,slug=slug,name=name,category="lugares",region=reg,subzone=name,status="oficial",summary=summ,description=desc,
        facts=[F("Mencionado por","Textos oficiales de Rockstar Games","oficial","rs-oil" if slug=="little-cuba" or slug=="ocean-beach" else "rs-vi"),F("Rótulo en el mapa oficial","Sí","oficial","rs-map")],
        sources=["rs-vi","rs-oil","rs-map"] ,mapPosition=pos,related=rel,tags=["subzona"])

# ---------------- PERSONAJES (oficial)
PJ=[
 ("jason-duval","Jason Duval","Quiere una vida fácil, pero todo se le complica.","Creció entre estafadores y delincuentes. Tras pasar por el Ejército intentando dejar atrás una adolescencia problemática, terminó en los Keys haciendo lo que mejor sabe: trabajar para narcotraficantes locales. Brian le presta una de sus propiedades a cambio de ayuda con «extorsiones locales».","p-jason","leonida-keys"),
 ("lucia-caminos","Lucia Caminos","Su padre le enseñó a pelear desde que aprendió a caminar.","Pelear por su familia la llevó a la Leonida Penitentiary; la pura suerte la sacó. Quiere la buena vida que su mamá soñó desde sus días en Liberty City y está dispuesta a tomar el control de su destino.","p-lucia","vice-city"),
 ("cal-hampton","Cal Hampton","¿Y si todo lo que dice internet fuera cierto?","Amigo de Jason y socio de Brian. Se siente más seguro en casa, espiando las comunicaciones de la Guardia Costera con unas cervezas y pestañas privadas abiertas.","p-cal","leonida-keys"),
 ("boobie-ike","Boobie Ike","Leyenda local de Vice City: bienes raíces, club y estudio de grabación.","Uno de los pocos que convirtió su pasado en las calles en un imperio legítimo de bienes raíces, un club de striptease y un estudio de grabación. Su apuesta más importante es Only Raw Records, junto a Dre'Quan.","p-boobie","vice-city"),
 ("drequan-priest","Dre'Quan Priest","Más buscavidas que gánster; su meta siempre fue la música.","Incluso cuando vendía en la calle, su objetivo era entrar a la industria musical. Firmó a Real Dimez para Only Raw Records.","p-drequan","vice-city"),
 ("real-dimez","Real Dimez","Bae-Luxe y Roxy: videos virales y ganchos virales.","Amigas desde la prepa, convirtieron en dinero sus tiempos de extorsionar a dealers locales con rap picante y una presencia constante en redes. Tras un éxito temprano con el rapero local DWNPLY, firmaron con Only Raw Records.","p-dimez","vice-city"),
 ("raul-bautista","Raul Bautista","Asaltabancos veterano siempre en busca de talento.","Confianza, encanto y astucia: un ladrón de bancos experimentado que busca talento dispuesto a asumir los riesgos que traen las mayores recompensas. Su imprudencia sube la apuesta con cada golpe.","p-raul","vice-city"),
 ("brian-heder","Brian Heder","Contrabandista clásico de la época dorada en los Keys.","Sigue moviendo mercancía desde su astillero con su tercera esposa, Lori. Lleva suficiente tiempo en el negocio como para dejar que otros hagan el trabajo sucio.","p-brian","leonida-keys"),
]
for slug,name,summ,desc,img,reg in PJ:
    add(id="pj-"+slug,slug=slug,name=name,category="personajes",region=reg,status="oficial",summary=summ,description=desc,
        facts=[F("Fuente de la biografía","Página oficial Only in Leonida","oficial","rs-oil")],sources=["rs-oil"],images=[img],tags=["personaje"])
for e in E:
    if e["id"] in ("pj-lucia-caminos","pj-cal-hampton","pj-raul-bautista","pj-real-dimez"): e["region"]="leonida"
UE="Requiere Grand Theft Auto VI: Ultimate Edition (o la mejora Ultimate Edition Upgrade)."
VV="Requiere el complemento digital Vintage Vice City Pack."
# ---------------- VEHÍCULOS (oficial)
add(id="veh-grotti-cheetah-95",slug="grotti-cheetah-95",name="’95 Grotti Cheetah",category="vehiculos",region="leonida",status="oficial",edition="ultimate",spoilerLevel=1,
 summary="Deportivo insignia de Grotti de mediados de los 90, con librea retrofuturista.",
 description="El deportivo emblemático de Grotti de mediados de los 90 y un homenaje a Shore Drive. Incluye una librea minimalista retrofuturista y, según Rockstar, está disponible para «rematar la acción de etapas avanzadas» de la historia.",
 howTo=["Se obtiene como beneficio de Ultimate Edition.","Rockstar indica que se desbloquea en una etapa avanzada de la historia; el capítulo exacto no está confirmado en las fuentes revisadas."],
 requirements=[UE],facts=[F("Tipo","Deportivo","oficial","rs-vi"),F("Edición","Ultimate Edition","oficial","rs-vi"),F("Desbloqueo","Etapa avanzada de la historia (sin capítulo exacto)","oficial","rs-vi")],
 sources=["rs-vi","rs-media"],images=["ue-cheetah"],tags=["deportivo","ultimate","grotti"])
add(id="veh-vapid-dominator-buggy-67",slug="vapid-dominator-buggy-67",name="’67 Vapid Dominator Buggy",category="vehiculos",region="grassrivers",status="oficial",edition="ultimate",
 summary="Monstruo del Mud Club para terracería, con garaje propio en Watson Bay.",
 description="Un monstruo del Mud Club con gran manejo todoterreno para los bosques de Mount Kalaga y más allá. Se guarda en el Paradise Garage de Watson Bay, que incluye armario de armas y un lugar seguro para depositar bienes robados que luego se venden.",
 requirements=[UE],howTo=["Recógelo en el Paradise Garage de Watson Bay (incluido con Ultimate Edition)."],
 facts=[F("Tipo","Buggy todoterreno","oficial","rs-vi"),F("Garaje","Paradise Garage, Watson Bay","oficial","rs-vi"),F("Extras del garaje","Armario de armas y depósito de bienes robados","oficial","rs-vi")],
 sources=["rs-vi","rs-media"],images=["ue-buggy"],related=["neg-paradise-garage","lug-watson-bay"],tags=["offroad","ultimate","vapid"])
add(id="veh-vapid-stanier-55",slug="vapid-stanier-55",name="’55 Vapid Stanier",category="vehiculos",region="vice-city",status="oficial",edition="vintage",
 summary="Sedán clásico con garaje personal Shore Court junto a Ocean Beach.",
 description="Sedán clásico para recorrer Shore Drive. Se guarda en el garaje personal Shore Court, a un paso de la arena de Ocean Beach, con armario de armas y depósito seguro para bienes robados.",
 requirements=[VV],facts=[F("Tipo","Sedán clásico","oficial","rs-vi"),F("Garaje","Shore Court, junto a Ocean Beach","oficial","rs-vi"),F("Paquete","Vintage Vice City Pack","oficial","rs-vi")],
 sources=["rs-vi","rs-media"],images=["vv-stanier"],related=["neg-shore-court"],tags=["clasico","vintage","vapid"])
add(id="veh-vapid-ganado",slug="vapid-ganado",name="Vapid Ganado",category="vehiculos",region="leonida",status="oficial",
 summary="La pickup baja y muy usada de Jason; Ultimate Edition añade el Ganado Retro Build.",
 description="Rockstar describe la Vapid Ganado como la pickup lowrider «muy usada» de Jason. Ultimate Edition añade el Ganado Retro Build: modificaciones exclusivas con más músculo y estilo clásico.",
 facts=[F("Tipo","Pickup lowrider","oficial","rs-vi"),F("Propietario en la historia","Jason","oficial","rs-vi"),F("Mejora exclusiva","Ganado Retro Build (Ultimate Edition)","oficial","rs-vi")],
 sources=["rs-vi"],images=["ue-ganado","ue-safehouse"],tags=["pickup","jason","vapid"])
add(id="veh-dinka-enduro",slug="dinka-enduro",name="Dinka Enduro",category="vehiculos",region="leonida",status="oficial",edition="ultimate",
 summary="Motocicleta con tono militar, estacionada en la casa de Jason (Ultimate Edition).",
 description="Parte de «Jason's Safehouse Vehicles»: una Dinka Enduro con un tono inspirado en los uniformes del Ejército, disponible junto a la casa de Jason.",
 requirements=[UE],facts=[F("Tipo","Motocicleta","oficial","rs-vi"),F("Ubicación","Casa de Jason","oficial","rs-vi")],sources=["rs-vi"],images=["ue-safehouse"],related=["neg-casa-jason"],tags=["moto","ultimate","dinka"])
add(id="veh-crest-kayak",slug="crest-kayak",name="Crest Kayak",category="vehiculos",region="leonida",status="oficial",edition="ultimate",
 summary="Kayak naranja disponible en la casa de Jason (Ultimate Edition).",
 description="El otro vehículo de «Jason's Safehouse Vehicles»: un Crest Kayak para remar bajo el sol.",
 requirements=[UE],facts=[F("Tipo","Kayak","oficial","rs-vi"),F("Ubicación","Casa de Jason","oficial","rs-vi")],sources=["rs-vi"],images=["ue-safehouse"],related=["neg-casa-jason"],tags=["agua","ultimate"])
add(id="veh-shitzu-squalo",slug="shitzu-squalo",name="Shitzu Squalo",category="vehiculos",region="vice-city",subzone="Washington Beach",status="oficial",edition="ultimate",
 summary="Lancha degradada rosa y azul, atracada en Washington Beach, con caja de armas explosivas.",
 description="Perfecta para pescar en Gambit Bay. Esta Squalo en degradado rosa y azul está atracada en Washington Beach y viene lista para mar abierto con una caja de armas cargada de explosivos.",
 requirements=[UE],facts=[F("Tipo","Lancha","oficial","rs-vi"),F("Atracadero","Washington Beach","oficial","rs-vi"),F("Extra","Caja de armas con explosivos","oficial","rs-vi")],
 sources=["rs-vi","rs-map"],images=["ue-squalo"],mapPosition=P(0.865,0.4445,"barrio","Atracadero indicado por Rockstar (Washington Beach); punto sobre el rótulo del mapa oficial, no sobre el muelle exacto."),related=["lug-washington-beach"],tags=["lancha","pesca","ultimate"])

# ---------------- ARMAS
add(id="arm-girardi-es9",slug="girardi-es9",name="Girardi ES9",category="armas",region="leonida",status="oficial",
 summary="Pistola de Jason; Ultimate Edition incluye una variante personalizada con grabados.",
 description="Rockstar confirma la Girardi ES9 como la pistola de Jason y ofrece en Ultimate Edition una variante personalizada con grabados detallados. GAMES.GG reporta variantes únicas como la «Sand Storm ES9» y la «Quarter Mile ES9».",
 facts=[F("Portador oficial","Jason","oficial","rs-vi"),F("Variante personalizada","Ultimate Edition","oficial","rs-vi"),F("Variantes únicas reportadas","Sand Storm ES9 (Big Shots, East Hamlet, $1,470); Quarter Mile ES9 (gratis)","reportado","gamesgg-unique")],
 sources=["rs-vi","gamesgg-unique"],images=["ue-pistolas"],tags=["pistola","jason"])
add(id="arm-klose-k17",slug="klose-k17",name="Klose K17",category="armas",region="leonida",status="oficial",
 summary="Pistola de servicio de Lucia; precio en Ammu-Nation reportado: $975.",
 description="Rockstar confirma la Klose K17 como la pistola de Lucia y ofrece en Ultimate Edition una variante personalizada. GAMES.GG reporta que la versión estándar cuesta $975 en Ammu-Nation.",
 facts=[F("Portadora oficial","Lucia","oficial","rs-vi"),F("Variante personalizada","Ultimate Edition","oficial","rs-vi"),F("Precio en Ammu-Nation","$975","reportado","gamesgg-ammu"),F("Variante única reportada","Nite Raptor K17 (Black Eagle, Balsero, $2,050)","reportado","gamesgg-unique")],
 reward=dict(label="Precio reportado",amount=dict(min=975,max=975),note="Precio de tienda; fuente única."),
 sources=["rs-vi","gamesgg-ammu","gamesgg-unique"],images=["ue-pistolas"],tags=["pistola","lucia"])
add(id="arm-hawk-little-morgan",slug="hawk-little-morgan",name="Hawk & Little Morgan Revolvers",category="armas",region="leonida",status="oficial",edition="ultimate",
 summary="Revólveres «de él y de ella» con estilo clásico de Vice City y mira de alto rendimiento.",
 description="Versiones de él y de ella de este potente revólver, con estilo clásico de Vice City procedente de la Vercetti Estate: cachas grabadas con palmeras, grabados detallados y mira de alto rendimiento.",
 requirements=[UE],facts=[F("Tipo","Revólver","oficial","rs-vi"),F("Edición","Ultimate Edition","oficial","rs-vi")],sources=["rs-vi","rs-media"],images=["ue-revolveres"],tags=["revolver","ultimate"])
add(id="arm-patron-tropical",slug="patron-tropical-vintage",name="Patrón de armas tropical",category="armas",region="leonida",status="oficial",edition="vintage",
 summary="Patrón para la mayoría de las armas inspirado en la camisa de palmeras de Tommy Vercetti.",
 description="«Channel the Original Kingpin»: decora la mayoría de las armas con un patrón tropical inspirado en la icónica camisa de palmeras de Tommy Vercetti.",
 requirements=[VV],facts=[F("Aplicable a","La mayoría de las armas","oficial","rs-vi"),F("Paquete","Vintage Vice City Pack","oficial","rs-vi")],sources=["rs-vi"],images=["vv-patron"],tags=["cosmetico","vintage"])
STD=[("scorpio-nipper-38","Scorpio Nipper .38","Pistola compacta",550,None),("fortune-son-moreland-850","Fortune & Son Moreland 850","Escopeta de bombeo",700,None),
 ("fortune-son-gorse-425","Fortune & Son Gorse 425","Escopeta corta (stubby)",850,None),("fortune-son-laird-350","Fortune & Son Laird 350","Rifle de francotirador deportivo",950,None),
 ("shrewsbury-drifter","Shrewsbury Drifter","Escopeta de doble cañón",1150,"Requiere cuenta bancaria"),("shrewsbury-hobo","Shrewsbury Hobo","Escopeta recortada de doble cañón",1325,"Requiere cuenta bancaria"),
 ("wortham-w-14","Wortham W-14","Rifle de combate",1400,"Requiere cuenta bancaria"),("duke-556","Duke 556","Carabina",1450,"Requiere cuenta bancaria")]
for slug,name,cls,price,req in STD:
    add(id="arm-"+slug,slug=slug,name=name,category="armas",region="leonida",status="reportado",patch=PATCH,
        summary=f"{cls} a la venta en Ammu-Nation; precio reportado: ${price:,}.",
        description=f"Arma estándar de Ammu-Nation según el inventario publicado por GAMES.GG con capturas del menú de compra. Precio reportado: ${price:,}."+(" El menú muestra «Requires a bank account» hasta abrir una cuenta bancaria." if req else "")+" Dato de fuente única: verifica el precio en tu partida.",
        howTo=["Visita cualquier Ammu-Nation (ver ficha «Red de tiendas Ammu-Nation»).","Compra en el mostrador; puedes cargar hasta dos armas cortas y dos largas, según la misma fuente."],
        requirements=[req+" (abre una cuenta bancaria en la historia)."] if req else [],
        facts=[F("Clase",cls,"reportado","gamesgg-ammu"),F("Precio",f"${price:,}","reportado","gamesgg-ammu")]+([F("Requisito",req,"reportado","gamesgg-ammu")] if req else []),
        reward=dict(label="Precio reportado",amount=dict(min=price,max=price),note="Fuente única; puede cambiar con parches."),
        risks=["Precio de fuente única: puede variar por parche o por tienda."],sources=["gamesgg-ammu"],related=["neg-ammu-nation"],tags=["ammu-nation","tienda"])
UNQ=[("star-spangled-556","Star Spangled 556","Carabina de asalto (única)","Phil's Ammu-Nation, Southside",3050,P(0.623,0.65,"barrio","Tienda reportada en Southside; punto sobre el rótulo «Southside» del mapa oficial."),"vice-city"),
 ("honky-tonk-mustang-357","Honky Tonk Mustang .357","Revólver mágnum (único)","Phil's Ammu-Nation, Southside",3780,P(0.623,0.65,"barrio","Tienda reportada en Southside; punto sobre el rótulo «Southside» del mapa oficial."),"vice-city"),
 ("vice-city-heathen","Vice City Heathen","Rifle de asalto bullpup (único)","Prestige Firearms, Ocean Beach",5150,P(0.862,0.5225,"barrio","Tienda reportada en Ocean Beach; punto sobre el rótulo del mapa oficial."),"vice-city"),
 ("little-cuba-hind","Little Cuba Hind","Rifle de asalto compacto (único)","Martez Empeños, Little Cuba",3570,P(0.661,0.533,"barrio","Tienda reportada en Little Cuba; punto sobre el rótulo del mapa oficial."),"vice-city")]
for slug,name,cls,store,price,pos,reg in UNQ:
    add(id="arm-"+slug,slug=slug,name=name,category="armas",region=reg,status="reportado",patch=PATCH,
        summary=f"{cls}. Reportada en {store} por ${price:,}.",
        description=f"Arma única reportada por GAMES.GG a la venta en {store}. La misma fuente indica que las armas únicas no se pueden modificar y que, una vez obtenidas, quedan disponibles para Jason y Lucia.",
        howTo=[f"Ve a {store}.",f"Compra el arma por ${price:,} (precio reportado)."],
        facts=[F("Clase",cls,"reportado","gamesgg-unique"),F("Tienda",store,"reportado","gamesgg-unique"),F("Precio",f"${price:,}","reportado","gamesgg-unique"),F("Modificable","No (según la fuente)","reportado","gamesgg-unique")],
        reward=dict(label="Precio reportado",amount=dict(min=price,max=price),note="Fuente única."),risks=["Fuente única: disponibilidad y precio sin verificar de forma independiente."],
        sources=["gamesgg-unique"],mapPosition=pos,related=["neg-ammu-nation"],tags=["unica","ammu-nation"])
FREE=[("drug-mule-kz-59","Drug Mule KZ-59","Rifle de asalto (único, gratis)","Bajo el agua junto a un barco hundido, costa norte de Riquezas Keys.",P(0.218,0.829,"zona","Ubicación reportada; punto sobre el rótulo «Riquezas Keys» del mapa oficial, no sobre el barco."),"leonida-keys",["Equipo de buceo recomendado: el arma está bajo el agua."]),
 ("assassin-nipper-38","Assassin Nipper .38","Pistola compacta (única, gratis)","Escotilla de un barco naufragado al sureste de Permit Keys.",P(0.37,0.844,"zona","Ubicación reportada; punto sobre el rótulo «Permit Keys» del mapa oficial."),"leonida-keys",[]),
 ("shark-knife","Shark Knife","Cuchillo (único, gratis)","Lecho marino junto a una jaula para tiburones, al norte de Saint Attaway Islands.",P(0.53,0.131,"zona","Ubicación reportada; punto sobre el rótulo «Saint Attaway Islands» del mapa oficial."),"mount-kalaga",["Zona submarina: lleva equipo de buceo."]),
 ("crabshack-vf5","Crabshack VF5","Subfusil militar (único, gratis)","Cabaña para botes del puesto de investigación de Pelican Valley.",P(0.522,0.733,"zona","Ubicación reportada; punto sobre el rótulo «Pelican Valley» del mapa oficial."),"grassrivers",[])]
for slug,name,cls,where,pos,reg,risk in FREE:
    add(id="arm-"+slug,slug=slug,name=name,category="armas",region=reg,status="reportado",patch=PATCH,spoilerLevel=1,
        summary=f"{cls}. {where}",description=f"Arma única gratuita reportada por GAMES.GG. Ubicación descrita por la fuente: {where} No hay una segunda fuente independiente; el punto del mapa indica la zona, no la posición exacta.",
        howTo=["Viaja a la zona marcada en el mapa (precisión: zona).","Busca el punto descrito por la fuente y recoge el arma."],
        facts=[F("Clase",cls,"reportado","gamesgg-unique"),F("Ubicación descrita",where,"reportado","gamesgg-unique"),F("Coste","Gratis","reportado","gamesgg-unique")],
        risks=["Fuente única."]+risk,sources=["gamesgg-unique","rs-map"],mapPosition=pos,tags=["gratis","unica","secreto"])
for e in E:
    if e["id"]=="arm-shark-knife": e["region"]="leonida"
# ---------------- NEGOCIOS Y PROPIEDADES
NEG=[
 ("rideout-customs","Rideout Customs","Taller de modificación","leonida",None,"Convierte vehículos comunes en obras de arte con interiores detallados, rines exquisitos y estilo donk.","Transforma vehículos «de vainilla» en obras de arte con interiores detallados, rines exquisitos y estilo donk. Solo abre con Ultimate Edition. Rockstar no publica su ubicación en el mapa.",["ue-rideout"],None,[]),
 ("saras-unisex-salon","Sara's Unisex Salon","Salón de belleza","leonida",None,"Estilos de salón para Jason (vello facial) y Lucia (maquillaje y uñas).","Estilos exclusivos para ambos protagonistas, incluido vello facial para Jason y maquillaje y uñas para Lucia. Solo abre con Ultimate Edition.",["ue-sara"],None,[]),
 ("stock-305","Stock 305","Tienda de ropa","vice-city","Stockyard","El destino de streetwear premium de Stockyard.","Looks únicos y exclusivos para Jason y Lucia en «el destino principal de streetwear elevado de Stockyard». Solo abre con Ultimate Edition.",["ue-stock305"],P(0.724,0.4497,"barrio","Rockstar ubica la tienda en Stockyard; punto sobre el rótulo del mapa oficial."),["lug-stockyard"]),
 ("electric-fang","Electric Fang Tattoo","Estudio de tatuajes","vice-city","Stockyard","Más de 50 tatuajes exclusivos diseñados por el colectivo FAILE.","El bar de tinta más icónico de Stockyard, con más de 50 tatuajes de autor para Jason y Lucia, todos diseñados por el colectivo artístico FAILE. Solo abre con Ultimate Edition.",["ue-electricfang"],P(0.724,0.4497,"barrio","Rockstar ubica el estudio en Stockyard; punto sobre el rótulo del mapa oficial."),["lug-stockyard"]),
 ("one-eyed-willies","One-Eyed Willie's","Taller todoterreno","ambrosia","Lake Leonida","Modificaciones todoterreno y pintura automotriz a mano en Lake Leonida.","Este taller de Lake Leonida se especializa en modificaciones todoterreno y arte automotriz pintado a mano. Solo abre con Ultimate Edition.",["ue-willie"],P(0.608,0.314,"zona","Rockstar ubica el taller en Lake Leonida; punto sobre el rótulo del lago en el mapa oficial."),["lug-lake-leonida"]),
 ("ptt-youngins","PTT Youngin$ Illegal Goods Store","Complejo de pandilla","vice-city","Southside","Asalta el complejo de una de las pandillas más ruidosas de Southside.","Asalta el complejo de una de las pandillas más escandalosas y activas en redes de Southside Vice City y escapa a salvo para conseguir artículos especiales y contrabando distintivo. Beneficio de Ultimate Edition.",["ue-ptt"],P(0.623,0.65,"barrio","Rockstar lo sitúa en Southside Vice City; punto sobre el rótulo «Southside» del mapa oficial."),[]),
 ("paradise-garage","Paradise Garage","Garaje","grassrivers","Watson Bay","Garaje en Watson Bay con armario de armas y depósito de bienes robados.","Garaje incluido con el ’67 Vapid Dominator Buggy. Incluye armario de armas y un lugar seguro para depositar bienes robados que se venden después.",["ue-buggy"],P(0.432,0.703,"barrio","Rockstar lo sitúa en Watson Bay; punto sobre el rótulo del mapa oficial."),["veh-vapid-dominator-buggy-67","lug-watson-bay"]),
 ("shore-court","Garaje Shore Court","Garaje personal","vice-city","Ocean Beach","Garaje personal a un paso de Ocean Beach (Vintage Vice City Pack).","Garaje personal incluido con el ’55 Vapid Stanier, «a un paso de la arena de Ocean Beach». Incluye armario de armas y depósito seguro de bienes robados.",["vv-stanier"],P(0.862,0.5225,"barrio","Rockstar lo sitúa junto a Ocean Beach; punto sobre el rótulo del mapa oficial."),["veh-vapid-stanier-55","lug-ocean-beach"]),
 ("casa-jason","Casa de Jason","Propiedad (historia)","leonida",None,"Brian deja que Jason viva sin pagar renta en una de sus propiedades.","Según Rockstar, Brian deja que Jason viva sin pagar renta en una de sus propiedades, siempre que le ayude con extorsiones locales. Con Ultimate Edition, afuera hay una Dinka Enduro y un Crest Kayak. La ubicación exacta no está publicada oficialmente, por eso no tiene punto en el mapa.",["ue-safehouse"],None,["veh-dinka-enduro","veh-crest-kayak","pj-brian-heder"]),
 ("only-raw-records","Only Raw Records","Disquera (historia)","vice-city",None,"La disquera de Boobie Ike y Dre'Quan Priest.","Sociedad de Boobie Ike y el aspirante a magnate musical Dre'Quan Priest. Real Dimez firmaron con el sello. Rockstar no publica su ubicación.",["p-drequan"],None,["pj-boobie-ike","pj-drequan-priest","pj-real-dimez"]),
 ("allied-crystal","Refinería Allied Crystal","Industria","ambrosia",None,"La refinería de azúcar que da empleo en Ambrosia.","Según Rockstar, la refinería de azúcar Allied Crystal proporciona los empleos de Ambrosia. Ubicación exacta no publicada; ver la región Ambrosia en el mapa.",["amb-skyline"],None,["lug-ambrosia"]),
 ("goodtime-gear","Goodtime Gear","Colección de ropa","leonida",None,"Ropa inspirada en Macca the Gator, el personaje de TV del «Goodtime State».","Colección cápsula de ropa y accesorios inspirada en Macca the Gator, personaje de un exitoso programa de TV del «Goodtime State». Beneficio de Ultimate Edition.",["ue-goodtime"],None,[]),
]
for slug,name,kind,reg,sub,summ,desc,imgs,pos,rel in NEG:
    ed="vintage" if slug=="shore-court" else ("base" if slug in ("casa-jason","only-raw-records","allied-crystal") else "ultimate")
    src=["rs-oil"] if slug in ("casa-jason","only-raw-records","allied-crystal") else ["rs-vi","rs-media"]
    if pos: src=src+["rs-map"]
    add(id="neg-"+slug,slug=slug,name=name,category="negocios",region=reg,subzone=sub,status="oficial",edition=ed,summary=summ,description=desc,
        requirements=[UE] if ed=="ultimate" else ([VV] if ed=="vintage" else []),
        facts=[F("Tipo",kind,"oficial",src[0])]+([F("Zona",sub,"oficial",src[0])] if sub else [])+[F("Disponibilidad",{"ultimate":"Ultimate Edition","vintage":"Vintage Vice City Pack","base":"Juego base (historia)"}[ed],"oficial",src[0])],
        sources=src,images=imgs,mapPosition=pos,related=rel,tags=["negocio",kind.lower()])
add(id="neg-ammu-nation",slug="ammu-nation",name="Red de tiendas Ammu-Nation",category="negocios",region="leonida",status="reportado",patch=PATCH,
 summary="24 armerías reportadas en Leonida, con cuatro niveles de inventario.",
 description="GAMES.GG reporta 24 Ammu-Nation repartidas por Leonida, clasificadas por inventario: 6 «Expanded», 15 «Standard», 2 «Hunting» y 1 «Limited». Las Expanded venden lanzacohetes, lanzagranadas y rifles de francotirador de gama alta. Fuente única: no publicamos puntos exactos en el mapa.",
 howTo=["Vice City y alrededores (reportado): Phil's Ammu-Nation (Southside, Expanded), Prestige Firearms (Ocean Beach, Expanded), Iron & Oak (Stockyard, Expanded), Black Eagle (Balsero, Expanded), Jackson Firearms (Balsero), Quickscope (Downtown), Martez Empeños (Little Cuba), Vice City Gun & Pawn (Rockridge), Pawn & Gun (Crosstown), Zenon's Pawn Shop (La Perle), Tequesta Guns & Ammo (Tequesta), Vice City Firearms (Salton).",
  "Keys, Hamlet y Mariana County (reportado): Chuck's Tackle & Shot (Key Lento, Limited), Barrage Gun Supply (Southwind), Guns Aplenty! (Watson Bay, Hunting), Richardson Hunting Supplies (North Mariana County), Woodhatch (Capri, Expanded), Big Shots (East Hamlet, Expanded), Hamlet Traders (Hamlet).",
  "Norte e interior (reportado): Gellhorn Outfitters y Pawn & Gun (Port Gellhorn), Biff's Gun Supply (Ambrosia), Tactical Outlet Guns (Belville), Rusty Willis Jr. Hunting Supplies (Lummox County, Hunting)."],
 facts=[F("Número de tiendas","24","reportado","gamesgg-ammu"),F("Niveles","Expanded 6 · Standard 15 · Hunting 2 · Limited 1","reportado","gamesgg-ammu"),F("Equipo","Parachute Bag $300 · Ammo Pack $950 · Explosives Pack $1,500","reportado","gamesgg-ammu")],
 risks=["Fuente única; los inventarios pueden cambiar con parches."],sources=["gamesgg-ammu"],images=[],tags=["armas","tiendas"])

# ---------------- DINERO (modo historia)
def money(gmin,gmax,costs,minutes,cool,est=True,note=""): return dict(grossMin=gmin,grossMax=gmax,costs=costs,minutesPerRun=minutes,cooldownMinutes=cool,estimate=est,note=note)
add(id="din-regla-capitulo-1",slug="no-farmees-en-el-capitulo-1",name="Regla clave: el efectivo del Capítulo 1 se pierde",category="dinero",region="leonida",status="contrastado",patch=PATCH,chapter="Capítulo 1",
 summary="Dos guías coinciden: el efectivo que llevas encima se pierde al terminar el Capítulo 1.",
 description="PowerPyx afirma que acumular dinero en el Capítulo 1 «no tiene sentido» porque se pierde al final del capítulo; GTA BOOM indica que el cierre del Capítulo 1 borra el efectivo que llevas encima y recomienda depositar en BuckMe (cuenta bancaria) y alcanzar la primera meta de Family Savings (unos $5,000) antes de la transición. GTA BOOM también señala que el efectivo en mano se pierde al morir o ser arrestado y que los bienes robados no se gastan hasta venderlos.",
 howTo=["Avanza la historia sin dedicar tiempo a farmear durante el Capítulo 1.","Cuando se desbloquee la cuenta BuckMe, deposita tu efectivo antes de actividades riesgosas.","Si quieres conservar algo, cumple la primera meta de Family Savings antes de terminar el capítulo (cifra reportada por una sola guía)."],
 facts=[F("Pérdida de efectivo al final del Cap. 1","Sí","contrastado","powerpyx-money","gtaboom-money"),F("Cuenta bancaria","BuckMe, se desbloquea a mitad del Cap. 1","reportado","gtaboom-money"),F("Primera meta de Family Savings","~$5,000","reportado","gtaboom-money"),F("Máximo de Family Savings (misión «Save for the Future»)","$2,000,000","reportado","powerpyx-money")],
 risks=["No confirmado por Rockstar; dos guías independientes lo describen igual."],sources=["powerpyx-money","gtaboom-money"],images=[],tags=["capitulo 1","banco","family savings"])
add(id="din-moses",slug="vender-autos-a-moses",name="Vender autos a Moses",category="dinero",region="port-gellhorn",status="contrastado",patch=PATCH,chapter="Capítulo 2",spoilerLevel=1,
 summary="Roba autos sin rastreador y véndelos a Moses: ~$1,000+ por auto en 1–2 minutos.",
 description="Ambas guías lo señalan como el método repetible del Capítulo 2. Moses solo acepta autos sin rastreador (los que tienen rastreador estándar se venden en Pay 'n' Spray). PowerPyx indica pagos típicos de $1,000+, 1–2 minutos de trabajo y un enfriamiento de unos 2 minutos; GTA BOOM reporta $1,000–$3,000 por auto. Rechaza vehículos robados demasiado cerca del taller: PowerPyx sugiere ir a la avenida principal de Port Gellhorn.",
 howTo=["Desbloquea el encargo «Moses (Take A Vehicle to Moses)» en el Capítulo 2.","Roba un auto sin rastreador lejos del taller (por ejemplo, en la avenida principal de Port Gellhorn).","Entrégalo a Moses y espera el enfriamiento (~2 min) antes del siguiente."],
 requirements=["Capítulo 2 de la historia.","Auto sin rastreador."],
 facts=[F("Pago por auto","$1,000+ (PowerPyx) · $1,000–$3,000 (GTA BOOM)","contrastado","powerpyx-money","gtaboom-money"),F("Duración","1–2 minutos","reportado","powerpyx-money"),F("Enfriamiento","~2 minutos","reportado","powerpyx-money"),F("Zona","Port Gellhorn","contrastado","powerpyx-money","gtaboom-money")],
 reward=dict(label="Pago por entrega",amount=dict(min=1000,max=3000),note="Rango combinado de dos guías."),time="1–2 min + ~2 min de enfriamiento (reportado)",
 money=money(1000,3000,0,2,2,True,"El pago depende del auto y su estado."),
 risks=["Robar autos puede generar nivel de búsqueda.","El pago varía según el vehículo."],sources=["powerpyx-money","gtaboom-money"],images=["vc-car-meet"],
 mapPosition=P(0.305,0.358,"region","Ambas guías sitúan el método en Port Gellhorn; el punto marca la región, no el taller."),tags=["autos","capitulo 2","repetible"])
add(id="din-joyerias-yasmani",slug="robos-a-joyerias-yasmani",name="Robos a joyerías (Yasmani)",category="dinero",region="leonida",status="contrastado",patch=PATCH,chapter="Capítulo 3",spoilerLevel=1,
 summary="Robos relámpago a joyerías: $10,000–$25,000 por golpe según dos guías.",
 description="PowerPyx y GTA BOOM coinciden en el rango de $10,000–$25,000 por robo. PowerPyx indica que se introducen en «Yasmani's Jewelry Jobs».",
 howTo=["Avanza hasta el Capítulo 3 y completa la introducción «Yasmani's Jewelry Jobs».","Realiza el robo rápido (smash-and-grab) y escapa.","Vende o deposita el botín según indique el juego antes de arriesgarte de nuevo."],
 requirements=["Capítulo 3."],facts=[F("Botín por robo","$10,000–$25,000","contrastado","powerpyx-money","gtaboom-money"),F("Introducción","Yasmani's Jewelry Jobs","reportado","powerpyx-money")],
 reward=dict(label="Botín por robo",amount=dict(min=10000,max=25000),note="Valor del botín reportado; ninguna guía detalla el neto tras la venta."),
 money=money(10000,25000,0,None,None,True,"Las guías no indican duración ni si el botín es valor nominal o efectivo neto."),
 risks=["Nivel de búsqueda al escapar.","Las guías no aclaran si el botín se recibe íntegro tras venderlo."],sources=["powerpyx-money","gtaboom-money"],images=["jl-banco"],tags=["robo","capitulo 3"])
add(id="din-randy",slug="lista-de-deseos-de-randy",name="Lista de deseos de Randy (superdeportivos)",category="dinero",region="leonida",status="contrastado",patch=PATCH,chapter="Capítulo 3",spoilerLevel=1,
 summary="Entrega superdeportivos con rastreador avanzado: $30,000+ por auto en perfecto estado.",
 description="Ambas guías dan $30,000+ por auto de la lista de Randy. PowerPyx indica que necesitas el Key Cloner de la misión «Clonin' Keys, Makin' GS» y que la lista tiene 18 autos; el pago exige que el auto llegue en perfecto estado.",
 howTo=["Completa «Clonin' Keys, Makin' GS» para obtener el Key Cloner.","Localiza un auto de la Wish List de Randy.","Entrégalo sin daños para cobrar el pago completo."],
 requirements=["Capítulo 3.","Key Cloner."],facts=[F("Pago","$30,000+ en perfecto estado","contrastado","powerpyx-money","gtaboom-money"),F("Autos en la lista","18","reportado","powerpyx-money"),F("Herramienta","Key Cloner","reportado","powerpyx-money")],
 reward=dict(label="Pago por auto",amount=dict(min=30000,max=30000),note="«$30,000+»: mínimo reportado; el máximo no se publica."),
 money=money(30000,30000,0,None,None,True,"El pago baja si el auto llega dañado."),risks=["Los daños reducen el pago."],sources=["powerpyx-money","gtaboom-money"],images=["ue-cheetah"],tags=["autos","capitulo 3"])
add(id="din-pay-n-spray",slug="autos-rastreados-pay-n-spray",name="Autos con rastreador estándar en Pay 'n' Spray",category="dinero",region="leonida",status="contrastado",patch=PATCH,chapter="Capítulo 3",spoilerLevel=1,
 summary="Vende autos con rastreador estándar: $2,500–$4,000+ según dos guías.",
 description="PowerPyx reporta alrededor de $4,000+ por un buen auto; GTA BOOM, $2,500–$4,000 para autos estándar.",
 facts=[F("Pago","$2,500–$4,000+","contrastado","powerpyx-money","gtaboom-money")],reward=dict(label="Pago por auto",amount=dict(min=2500,max=4000),note="Rango combinado."),
 money=money(2500,4000,0,None,None,True,""),sources=["powerpyx-money","gtaboom-money"],images=["vc-gasolinera"],tags=["autos"])
add(id="din-operaciones-ilegales",slug="operaciones-ilegales",name="Operaciones ilegales (escondites de pandillas)",category="dinero",region="leonida",status="contrastado",patch=PATCH,chapter="Capítulo 1",
 summary="Escondites marcados en el mapa: ~$1,000–$2,000+ por sitio (pago reportado).",
 description="PowerPyx indica que los «Gang Operations» son iconos amarillos en el mapa (39 ubicaciones). GTA BOOM los llama «Illegal Operations» y reporta ~$1,000–$2,000+ por sitio saqueado por completo, mencionando las cabañas de pesca de los Kingfishers al noroeste de Key Lento. GAMES.GG reporta que varias de estas operaciones esconden armas únicas.",
 facts=[F("Existencia e icono en el mapa","Sí (iconos amarillos)","reportado","powerpyx-money"),F("Mencionadas por","PowerPyx y GTA BOOM","contrastado","powerpyx-money","gtaboom-money"),F("Número de ubicaciones","39","reportado","powerpyx-money"),F("Pago por sitio","~$1,000–$2,000+","reportado","gtaboom-money")],
 reward=dict(label="Botín por sitio",amount=dict(min=1000,max=2000),note="Fuente única para la cifra."),money=money(1000,2000,0,None,None,True,"Cifra de una sola guía."),
 risks=["Combate armado.","Cifra de pago de fuente única."],sources=["powerpyx-money","gtaboom-money","gamesgg-unique"],images=["gr-aerodeslizador"],tags=["pandillas","capitulo 1"])
REP=[("asaltos-a-tiendas","Asaltos a tiendas","Apunta al cajero y saquea la caja: «unos cientos» de dólares.","PowerPyx describe el método (apuntar al dependiente y saquear la caja); GTA BOOM reporta pagos de «unos cientos» y recomienda mantener a los civiles quietos y guardar el arma.","Capítulo 1",["powerpyx-money","gtaboom-money"],"contrastado",None,[F("Método","Apuntar al dependiente y saquear la caja","contrastado","powerpyx-money","gtaboom-money"),F("Pago","«Low hundreds» (unos cientos)","reportado","gtaboom-money")],0,["vc-gasolinera"]),
 ("carreras","Carreras callejeras","40 ubicaciones de carrera reportadas; pago no publicado.","PowerPyx menciona ganar carreras desde el Capítulo 1 y cuenta 40 ubicaciones únicas, sin publicar el pago.","Capítulo 1",["powerpyx-money"],"reportado",None,[F("Ubicaciones","40","reportado","powerpyx-money"),F("Pago","No publicado","pendiente","powerpyx-money")],0,["vc-car-meet"]),
 ("paquetes-de-donnie","Paquetes de droga para Donnie","Entrega paquetes recuperados: ~$900 cada uno (4 ubicaciones).","GTA BOOM reporta que, tras la misión «Lab Fees», Donnie compra paquetes recuperados por ~$900 cada uno en cuatro ubicaciones.","Capítulo 1",["gtaboom-money"],"reportado",(900,900),[F("Pago","~$900 por paquete","reportado","gtaboom-money"),F("Ubicaciones","4","reportado","gtaboom-money")],1,[]),
 ("tesoros-de-kenton","Inmersiones de tesoro (Kenton)","Naufragios con botín: ~$1,400+ los primeros.","GTA BOOM reporta que, tras la misión «Island Dreams» en Leonida Keys, las inmersiones a naufragios pagan ~$1,400 en adelante; requiere equipo de buceo.","Capítulo 1",["gtaboom-money"],"reportado",(1400,1400),[F("Pago","~$1,400+","reportado","gtaboom-money"),F("Requisito","Equipo de buceo","reportado","gtaboom-money")],1,["keys-buceo"]),
 ("casas-de-empeno","Casas de empeño","Vende objetos robados: ~$1,000–$12,000.","GTA BOOM reporta ventas de ~$1,000 a $12,000 en casas de empeño desde mediados del Capítulo 2.","Capítulo 2",["gtaboom-money"],"reportado",(1000,12000),[F("Pago","~$1,000–$12,000","reportado","gtaboom-money")],1,[]),
 ("bancos-pequenos","Bancos pequeños y préstamos (Payday Loans)","~$5,000–$45,000; los billetes marcados requieren Dye Pack Jammer.","GTA BOOM reporta ~$5,000–$45,000 desde mediados del Capítulo 3 («Credit Check») y que el Dye Pack Jammer es necesario para los billetes marcados (con un caso reportado de $45,000). PowerPyx menciona que Yasmani vende datos de camiones de valores por $10,000 tras dos robos Payday Loan.","Capítulo 3",["gtaboom-money","powerpyx-money"],"reportado",(5000,45000),[F("Pago","~$5,000–$45,000","reportado","gtaboom-money"),F("Herramienta","Dye Pack Jammer","reportado","gtaboom-money"),F("Datos de Yasmani (camiones de valores)","Cuestan $10,000","reportado","powerpyx-money")],1,["jl-banco"]),
 ("bovedas-bancarias","Bóvedas de bancos grandes","Hasta $205,000 por golpe (fuente única); da 4 estrellas al instante.","PowerPyx reporta que la misión opcional «That's Where The Money Is…» al final del Capítulo 4 (antes del punto de no retorno) desbloquea robos a bóvedas grandes de hasta $205,000, con unos $100,000–$200,000 cada 5 minutos tras la historia. Activan 4 estrellas de búsqueda al instante. GTA BOOM no lo confirma y dice que los mayores robos se retienen por diseño.","Final del Capítulo 4",["powerpyx-money"],"reportado",(100000,205000),[F("Pago","Hasta $205,000","reportado","powerpyx-money"),F("Ritmo tras la historia","~$100,000–$200,000 cada 5 min","reportado","powerpyx-money"),F("Búsqueda","4 estrellas al instante","reportado","powerpyx-money")],2,["jl-banco"]),
 ("recompensa-capitulo-3","Recompensa de historia del Capítulo 3","$120,000 automáticos al terminar el Capítulo 3 (fuente única).","PowerPyx indica que recibes $120,000 automáticamente al final del Capítulo 3 por avanzar la historia.","Final del Capítulo 3",["powerpyx-money"],"reportado",(120000,120000),[F("Pago","$120,000","reportado","powerpyx-money")],2,[]),
]
for slug,name,summ,desc,ch,src,st,amt,facts,sp,imgs in REP:
    mm=None; rw=None
    if amt:
        rw=dict(label="Pago reportado",amount=dict(min=amt[0],max=amt[1]),note="Ver nivel de evidencia de cada dato.")
        mm=money(amt[0],amt[1],10000 if slug=="bancos-pequenos" else 0,5 if slug=="bovedas-bancarias" else None,None,True,"")
    add(id="din-"+slug,slug=slug,name=name,category="dinero",region="leonida",status=st,patch=PATCH,chapter=ch,spoilerLevel=sp,summary=summ,description=desc,
        facts=facts,reward=rw,money=mm,risks=(["Fuente única: puede no reproducirse igual."] if len(src)==1 else [])+(["Nivel de búsqueda alto."] if "banc" in slug or "boveda" in slug else []),
        sources=src,images=imgs,tags=["dinero"])
for e in E:
    if e["id"]=="din-bancos-pequenos": e["money"]["costs"]=0
# ---------------- RUTAS Y TUTORIALES (contenido editorial propio)
add(id="rut-empieza-aqui",slug="empieza-aqui",name="Empieza aquí: cómo leer LEONIDA ATLAS",category="rutas",region="leonida",status="oficial",
 summary="Qué significa cada nivel de evidencia y cómo sacarle provecho a la guía.",
 description="LEONIDA ATLAS separa lo confirmado de lo reportado. Cada ficha y cada dato llevan una etiqueta: «Oficial» (Rockstar Games/Take-Two), «Comprobado» (reproducido en una partida documentada), «Contrastado» (dos fuentes independientes coinciden), «Reportado» (una sola fuente no oficial), «Pendiente» (falta información) y «Obsoleto» (ya no aplica). Los puntos del mapa declaran su precisión: región, zona o barrio. Nada se presenta como coordenada exacta.",
 howTo=["Usa el buscador (tolera acentos y errores leves).","Filtra por región, categoría, capítulo, evidencia y nivel de spoiler.","Guarda fichas con ★ y marca tu progreso con ✓; tus datos se quedan en tu dispositivo.","Comparte una ficha: el enlace abre directamente esa página."],
 facts=[F("Fuente de los niveles","Política editorial de LEONIDA ATLAS","oficial","rs-vi")],sources=["rs-vi"],images=[],tags=["tutorial","inicio"])
add(id="rut-dinero-por-capitulo",slug="ruta-de-dinero-por-capitulo",name="Ruta de dinero por capítulo (modo historia)",category="rutas",region="leonida",status="contrastado",patch=PATCH,spoilerLevel=1,
 summary="Qué hacer en cada capítulo según las guías revisadas, sin prometer cifras infinitas.",
 description="Síntesis de PowerPyx y GTA BOOM. Capítulo 1: avanza la historia y protege tu efectivo (se pierde al final del capítulo). Capítulo 2: vende autos sin rastreador a Moses. Capítulo 3: robos a joyerías de Yasmani y autos de la lista de Randy. Final del Capítulo 4: bóvedas grandes (fuente única). Usa la calculadora para comparar con tus propios tiempos.",
 howTo=["Capítulo 1 → lee «Regla clave: el efectivo del Capítulo 1 se pierde».","Capítulo 2 → «Vender autos a Moses» (contrastado).","Capítulo 3 → «Robos a joyerías» y «Lista de deseos de Randy» (contrastados).","Final del Capítulo 4 → «Bóvedas de bancos grandes» (reportado, spoiler)."],
 facts=[F("Coincidencia entre guías","Capítulos 1–3","contrastado","powerpyx-money","gtaboom-money"),F("Bóvedas del Capítulo 4","Solo PowerPyx","reportado","powerpyx-money")],
 sources=["powerpyx-money","gtaboom-money"],images=[],related=["din-regla-capitulo-1","din-moses","din-joyerias-yasmani","din-randy","din-bovedas-bancarias"],tags=["dinero","ruta"])
add(id="rut-ruta-1a-keys",slug="por-la-1a-hasta-mile-zero",name="Por la 1A hasta Mile Zero (ruta orientativa)",category="rutas",region="leonida-keys",status="oficial",
 summary="Recorrido escénico por los cayos trazado sobre el mapa oficial: Hamlet → Key Lento → Southwind.",
 description="Ruta editorial trazada a partir del mapa oficial de Leonida, donde la ruta 1A baja desde la zona de Hamlet, pasa por Shoeless Keys y Key Lento, y continúa hacia el oeste por Maroon Key y Abismo Key hasta Southwind y Mile Zero Air Station. Es una sugerencia turística: no indica tiempos ni eventos garantizados.",
 howTo=["Sal de Hamlet hacia el sur por la 1A (cuadrícula I–J/6 del mapa oficial).","Cruza Shoeless Keys y llega a Key Lento (cuadrícula K/5–6).","Sigue la 1A hacia el oeste por Maroon Key y Abismo Key (cuadrícula L/4–5).","Termina en Southwind y Mile Zero Air Station (cuadrícula L/3)."],
 facts=[F("Trazado","Ruta 1A visible en el mapa oficial","oficial","rs-map"),F("Puntos rotulados","Hamlet, Shoeless Keys, Key Lento, Maroon Key, Abismo Key, Southwind, Mile Zero Air Station","oficial","rs-map")],
 sources=["rs-map","rs-oil"],images=["keys-hidroavion"],mapPosition=P(0.568,0.833,"zona","Punto de referencia en Key Lento; la ruta completa se describe por cuadrícula."),related=["lug-leonida-keys"],tags=["ruta","paseo","cayos"])
add(id="rut-tour-6-regiones",slug="tour-por-las-6-regiones",name="Tour por las 6 regiones de Leonida",category="rutas",region="leonida",status="oficial",
 summary="Un recorrido de norte a sur basado en las descripciones oficiales de cada región.",
 description="Recorre Leonida de norte a sur: Mount Kalaga (frontera norte), Port Gellhorn (costa oeste), Ambrosia (centro, junto a Lake Leonida), Vice City (costa este), Grassrivers (humedales del sur) y Leonida Keys (cayos). Cada parada enlaza con su ficha y su punto en el mapa.",
 howTo=["Mount Kalaga National Park — caza, pesca y senderos.","Port Gellhorn — la costa olvidada.","Ambrosia — refinería Allied Crystal.","Vice City — playas y vida nocturna.","Grassrivers — humedales y caimanes.","Leonida Keys — bares y buceo."],
 facts=[F("Regiones oficiales","6","oficial","rs-oil"),F("Ubicación relativa","Según el mapa oficial","oficial","rs-map")],sources=["rs-oil","rs-map"],images=["mk-carretera"],
 related=["lug-mount-kalaga","lug-port-gellhorn","lug-ambrosia","lug-vice-city","lug-grassrivers","lug-leonida-keys"],tags=["ruta","regiones"])
add(id="rut-classic-car-collection",slug="classic-car-collection-wyman",name="Encargo especial: Classic Car Collection",category="rutas",region="leonida",status="oficial",edition="ultimate",
 summary="Encuentra autos clásicos abandonados y restáuralos para el coleccionista Wyman.",
 description="Encargo especial de Ultimate Edition: localiza diversos autos clásicos abandonados y proyectos a medio terminar, y devuélvelos a su gloria original para Wyman, coleccionista excéntrico y «fixer» local. Rockstar no publica la lista de autos ni sus ubicaciones; no publicamos ubicaciones hasta verificarlas.",
 requirements=[UE],facts=[F("Tipo","Encargo especial (Special Commission)","oficial","rs-vi"),F("Cliente","Wyman","oficial","rs-vi"),F("Ubicaciones de los autos","Sin verificar","pendiente","rs-vi")],
 sources=["rs-vi"],images=["ue-wyman"],tags=["autos","coleccionable","ultimate"])
add(id="rut-ediciones",slug="ediciones-y-complementos",name="Ediciones y complementos de GTA VI",category="rutas",region="leonida",status="oficial",
 summary="Qué incluyen Standard, Ultimate Edition y el Vintage Vice City Pack.",
 description="Rockstar ofrece la Standard Edition (digital o código en caja), la Ultimate Edition —una colección exclusiva de vehículos, armas, ropa y acción repartida por todos los capítulos de la historia de Jason y Lucia— y el complemento digital Vintage Vice City Pack (’55 Vapid Stanier con garaje junto a Ocean Beach, atuendos y peinados retro y patrón de armas tropical). La Ultimate Edition Upgrade mejora una Standard. Los miembros de GTA+ en consola reciben beneficios opcionales.",
 howTo=["Ultimate Edition: ’95 Grotti Cheetah, Hawk & Little Morgan Revolvers, variantes personalizadas de armas, Vice City Style, vehículos de la casa de Jason, Ganado Retro Build, Rideout Customs, Sara's Unisex Salon, Shitzu Squalo, Stock 305, ’67 Vapid Dominator Buggy, Electric Fang Tattoo, One-Eyed Willie's, Goodtime Gear, PTT Youngin$ y Classic Car Collection.","Vintage Vice City Pack: ’55 Vapid Stanier y garaje personal, atuendos y peinados, patrón de armas."],
 facts=[F("Plataformas","PlayStation 5 y Xbox Series X|S","oficial","rs-vi","rs-news-launch"),F("Fecha de lanzamiento","19 de noviembre de 2026","oficial","rs-news-launch","rs-vi"),F("Clasificación","ESRB Mature 17+ con compras dentro del juego","oficial","rs-vi"),F("Precio","No mostrado en la página oficial revisada","pendiente","rs-vi")],
 sources=["rs-vi","rs-news-launch","rs-media"],images=["ue-goodtime"],tags=["ediciones","ultimate","vintage"])

import json
for e in E:
    e.setdefault("sources",[])
json.dump(E,open(__import__('os').path.join(__import__('os').path.dirname(__import__('os').path.abspath(__file__)),'..','content','entries.json'),'w'),indent=1,ensure_ascii=False)
print(len(E))
from collections import Counter
print(Counter(e['category'] for e in E)); print(Counter(e['status'] for e in E))
