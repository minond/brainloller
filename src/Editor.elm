module Editor
    exposing
        ( cmdContentBtn
        , cmdTextBtn
        , commandsForm
        , link
        , mainTitle
        , memoryTape
        , programCells
        , textCopy
        , textLabel
        )

import Color exposing (Color, rgb)
import Html exposing (Attribute, Html, a, div, h1, label, p, span, text, button)
import Html.Attributes exposing (class, classList, href, style, tabindex, target, title)
import Html.Events exposing (onClick, onMouseDown, onMouseOver, onMouseUp)
import Lang
    exposing
        ( BLOptCode
        , BLProgram
        , BLRuntime
        , Pixel
        , blCmd
        , getCellAt
        , programDimensions
        , resizeProgram
        )
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


cmdContentBtn : String -> List (Attribute msg) -> List (Html msg) -> Html msg
cmdContentBtn val attrs content =
    button
        ([ class "mr2 mb2 pointer" ] ++ attrs)
        ([ text val ] ++ content)


cmdTextBtn : String -> List (Attribute msg) -> Html msg
cmdTextBtn val attrs =
    button
        ([ class "mr2 mb2 pointer" ] ++ attrs)
        [ text val ]


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


textLabel : String -> List (Html msg) -> Html msg
textLabel name children =
    div
        [ classes
            [ Tac.lh_copy
            , Tac.helvetica
            , "label"
            ]
        ]
        (span [] [ text name ] :: children)


pixelColor : Pixel -> Color
pixelColor { r, g, b } =
    rgb r g b


pixelStyle : Pixel -> ( String, String )
pixelStyle p =
    ( "backgroundColor", "rgb(" ++ toString p.r ++ ", " ++ toString p.g ++ ", " ++ toString p.b ++ ")" )


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
