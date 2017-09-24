module Editor
    exposing
        ( cmdBtn
        , cmdContentBtn
        , cmdTextBtn
        , commandsForm
        , getCellMaybe
        , link
        , mainTitle
        , memoryTape
        , programCells
        , programDimensions
        , programForm
        , resizeProgram
        , setCellAt
        , stylesheet
        , textCopy
        )

import Brainloller.Lang exposing (BLOptCode, BLProgram, BLRuntime, Pixel, blCmd)
import Collage exposing (Form, filled, move, square)
import Color exposing (Color, rgb)
import Html exposing (Attribute, Html, a, div, h1, img, label, node, p, text)
import Html.Attributes exposing (class, classList, href, rel, src, style, tabindex, target, title)
import Html.Events exposing (onClick, onMouseDown, onMouseOver, onMouseUp)
import List.Extra exposing (getAt, setAt)
import Maybe
import Tachyons exposing (classes)
import Tachyons.Classes as Tac
import Util exposing (asList, ternary)


type alias BoardConfig =
    { cellSize : Int
    , width : Int
    , startX : Int
    , startY : Int
    }


link : String -> String -> Bool -> Html msg
link label to external =
    a
        [ href to
        , target (ternary external "_blank" "_self")
        , classes
            [ Tac.link
            , Tac.dim
            , Tac.blue
            ]
        ]
        [ text label ]


cmdBtn : String -> String -> List (Attribute msg) -> Html msg
cmdBtn label imgSrc attrs =
    div (title label :: tabindex 1 :: class "cmd-btn" :: attrs)
        [ img
            [ src imgSrc ]
            []
        ]


cmdContentBtn : String -> List (Attribute msg) -> List (Html msg) -> Html msg
cmdContentBtn name attrs content =
    div (title name :: tabindex 1 :: class "cmd-btn" :: attrs)
        [ label
            [ class "cmd-btn-content" ]
            ([ text name ] ++ content)
        ]


cmdTextBtn : String -> List (Attribute msg) -> Html msg
cmdTextBtn name attrs =
    div (title name :: tabindex 1 :: class "cmd-btn" :: attrs)
        [ label
            [ class "cmd-btn-content" ]
            [ text name ]
        ]


stylesheet : String -> Html msg
stylesheet url =
    node "link"
        [ rel "stylesheet"
        , href url
        ]
        []


mainTitle : String -> Html msg
mainTitle title =
    let
        h1Classes =
            [ Tac.mt0
            , Tac.f3
            , Tac.f2_m
            , Tac.f1_l
            , Tac.fw1
            , Tac.baskerville
            ]
    in
    h1 [ classes h1Classes ]
        [ text title ]


textCopy : List (Html msg) -> Html msg
textCopy copy =
    let
        pClasses =
            [ Tac.lh_copy
            , Tac.helvetica
            ]
    in
    p
        [ classes pClasses ]
        copy


pixelColor : Pixel -> Color
pixelColor { r, g, b } =
    rgb r g b


pixelStyle : Pixel -> ( String, String )
pixelStyle p =
    ( "backgroundColor", "rgb(" ++ toString p.r ++ ", " ++ toString p.g ++ ", " ++ toString p.b ++ ")" )


setCellAt : BLProgram -> Int -> Int -> Pixel -> BLProgram
setCellAt program x y p =
    let
        row =
            asList (getAt y program)

        updatedRow =
            asList (setAt x p row)

        updatedProgram =
            asList (setAt y updatedRow program)
    in
    updatedProgram


getCellAt : BLProgram -> Int -> Int -> Pixel
getCellAt program x y =
    getCellMaybe program x y
        |> Maybe.withDefault
            { r = 255, g = 255, b = 255 }


getCellMaybe : BLProgram -> Int -> Int -> Maybe Pixel
getCellMaybe program x y =
    getAt x (asList (getAt y program))


resizeProgram : BLProgram -> Int -> Int -> BLProgram
resizeProgram program x y =
    let
        dims =
            programDimensions program

        width =
            max (x + 1) (Tuple.first dims)

        height =
            max (y + 1) (Tuple.second dims)
    in
    List.indexedMap
        (\y _ ->
            List.indexedMap
                (\x _ ->
                    getCellAt program x y
                )
                (List.repeat width Nothing)
        )
        (List.repeat height Nothing)


programDimensions : BLProgram -> ( Int, Int )
programDimensions program =
    let
        height =
            List.length program

        width =
            Maybe.withDefault 0 <|
                Maybe.andThen
                    (\row -> Just <| List.length row)
                    (List.head program)
    in
    ( width, height )


programCells : Int -> Int -> BLProgram -> BLRuntime -> (Int -> Int -> Bool -> msg) -> msg -> msg -> Html msg
programCells width height program runtime writeHandler enableHandler disableHandler =
    div
        [ onMouseDown enableHandler
        , onMouseUp disableHandler
        ]
    <|
        List.indexedMap
            (\rowIndex row ->
                row <|
                    List.indexedMap
                        (\cellIndex cell ->
                            let
                                pixel =
                                    getCellAt program cellIndex rowIndex

                                isActive =
                                    runtime.activeCoor == ( cellIndex, rowIndex )
                            in
                            cell
                                [ onClick (writeHandler cellIndex rowIndex True)
                                , onMouseDown (writeHandler cellIndex rowIndex True)
                                , onMouseOver (writeHandler cellIndex rowIndex False)
                                , style [ pixelStyle pixel ]
                                , classList
                                    [ ( "program-cell", True )
                                    , ( "program-cell--active", isActive )
                                    ]
                                ]
                                []
                        )
                        (List.repeat width div)
            )
        <|
            List.repeat height <|
                div [ class "program-row" ]


pixelForm : BoardConfig -> Int -> Pixel -> Form
pixelForm board index pixel =
    let
        x =
            rem index board.width * board.cellSize - board.startX

        y =
            (index // board.width) * board.cellSize + board.startY

        point =
            ( toFloat x, toFloat y )

        color =
            rgb pixel.r pixel.g pixel.b
    in
    move point <| filled color <| square 20


programForm : BLProgram -> List Form
programForm program =
    let
        cellSize =
            20

        height =
            List.length program

        width =
            Maybe.withDefault 0 <|
                Maybe.andThen
                    (\row -> Just <| List.length row)
                    (List.head program)

        startX =
            width // 2 * cellSize

        startY =
            height // 2 * cellSize * -1

        continuous =
            List.foldl (++) [] program

        board =
            { cellSize = cellSize
            , width = width
            , startX = width // 2 * cellSize
            , startY = startY
            }

        processPixel =
            \index pixel ->
                pixelForm board index pixel
    in
    List.indexedMap processPixel continuous


commandsForm : (BLOptCode -> msg) -> BLOptCode -> List (Html msg)
commandsForm cmdSetter activeCmd =
    let
        picker =
            \label cmd ->
                div
                    [ onClick (cmdSetter cmd)
                    , tabindex 1
                    , title label
                    , classList
                        [ ( "cmd-btn", True )
                        , ( "cmd-btn-active", cmd == activeCmd )
                        , ( "cmd-btn--" ++ cmd, True )
                        ]
                    ]
                    []
    in
    [ picker ">" blCmd.shiftRight
    , picker "<" blCmd.shiftLeft
    , picker "+" blCmd.increment
    , picker "-" blCmd.decrement
    , picker "." blCmd.ioWrite
    , picker "," blCmd.ioRead
    , picker "[" blCmd.loopOpen
    , picker "]" blCmd.loopClose
    , picker "+90" blCmd.rotateClockwise
    , picker "-90" blCmd.rotateCounterClockwise
    ]


memoryTape : BLRuntime -> List (Html msg)
memoryTape runtime =
    let
        cell =
            \i val ->
                div
                    [ classList
                        [ ( "program-memory-cell", True )
                        , ( "program-memory-cell--active", runtime.activeCell == i )
                        ]
                    ]
                    [ div
                        [ class "program-memory-cell-content" ]
                        [ text (toString val) ]
                    ]

        len =
            List.length runtime.memory

        padding =
            List.drop len <| List.repeat 10 0

        cells =
            runtime.memory ++ padding
    in
    List.indexedMap cell cells
