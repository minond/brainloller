module Editor exposing (commandsForm, memoryTape, programCells)

import Brainloller
import Color exposing (Color, rgb)
import Html exposing (Attribute, Html, a, button, div, h1, label, p, span, text)
import Html.Attributes exposing (class, classList, href, style, tabindex, target, title)
import Html.Events exposing (onClick, onMouseDown, onMouseOver, onMouseUp)
import List.Extra exposing (getAt, setAt)
import Maybe
import Tachyons exposing (classes)
import Tachyons.Classes as Tac


pixelStyle : Brainloller.Pixel -> ( String, String )
pixelStyle p =
    ( "backgroundColor", "rgb(" ++ toString p.r ++ ", " ++ toString p.g ++ ", " ++ toString p.b ++ ")" )


programCells : Int -> Int -> Brainloller.Program -> Brainloller.Runtime -> (Int -> Int -> Bool -> msg) -> msg -> msg -> Html msg
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
                                    Brainloller.getCellAt program cellIndex rowIndex

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


commandsForm : (Brainloller.Optcode -> msg) -> Brainloller.Optcode -> List (Html msg)
commandsForm cmdSetter activeCmd =
    let
        cmds =
            Brainloller.cmds

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
    [ picker ">" cmds.shiftRight
    , picker "<" cmds.shiftLeft
    , picker "+" cmds.increment
    , picker "-" cmds.decrement
    , picker "." cmds.ioWrite
    , picker "," cmds.ioRead
    , picker "[" cmds.loopOpen
    , picker "]" cmds.loopClose
    , picker "+90" cmds.rotateClockwise
    , picker "-90" cmds.rotateCounterClockwise
    ]


memoryTape : Brainloller.Runtime -> List (Html msg)
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
