module Main exposing (main)

import Brainloller.Lang exposing (BLOptCode, BLProgram, blCmdPixel, getBlCmd)
import Brainloller.Pixel exposing (commandsForm, getCellMaybe, programCells, programDimensions, resizeProgram, setCellAt)
import Brainloller.Program exposing (progHelloWorld)
import Elem exposing (cmdBtn, link, mainTitle, stylesheet, textCopy)
import Html exposing (Html, div, text)
import Html.Attributes exposing (class, style)
import Html.Events exposing (onClick)
import List
import Maybe
import Tachyons exposing (classes)
import Tachyons.Classes as Tac
import Tuple exposing (first, second)
import Util exposing (mapBoth)


type Msg
    = SetCmd BLOptCode
    | WriteCmd Int Int Bool
    | EnableWrite
    | DisableWrite
    | IncreaseSize
    | DecreaseSize
    | ZoomIn
    | ZoomOut
    | Reset


type alias Model =
    { program : BLProgram
    , activeCmd : Maybe BLOptCode
    , boardDimensions : ( Int, Int )
    , zoomLevel : Float
    , writeEnabled : Bool
    }


main =
    Html.program
        { init = ( initialModel, Cmd.none )
        , view = view
        , update = update
        , subscriptions = subscriptions
        }


initialModel : Model
initialModel =
    { program = progHelloWorld
    , activeCmd = Nothing
    , boardDimensions = mapBoth ((+) 1) (programDimensions progHelloWorld)
    , zoomLevel = 1
    , writeEnabled = False
    }


update : Msg -> Model -> ( Model, Cmd Msg )
update message model =
    case ( message, model, model.activeCmd ) of
        ( WriteCmd x y force, { writeEnabled, program }, Just activeCmd ) ->
            let
                pixel =
                    getBlCmd activeCmd blCmdPixel

                rewrite =
                    force || writeEnabled

                resized =
                    if rewrite then
                        resizeProgram program x y
                    else
                        program

                updated =
                    case ( rewrite, getCellMaybe resized x y ) of
                        ( True, Just _ ) ->
                            setCellAt resized x y pixel

                        _ ->
                            program
            in
            ( { model | program = updated }, Cmd.none )

        ( WriteCmd _ _ _, _, Nothing ) ->
            ( model, Cmd.none )

        ( SetCmd cmd, _, _ ) ->
            ( { model | activeCmd = Just cmd }, Cmd.none )

        ( EnableWrite, _, _ ) ->
            ( { model | writeEnabled = True }, Cmd.none )

        ( DisableWrite, _, _ ) ->
            ( { model | writeEnabled = False }, Cmd.none )

        ( IncreaseSize, { boardDimensions }, _ ) ->
            ( { model
                | boardDimensions =
                    ( first boardDimensions + 1, second boardDimensions + 1 )
              }
            , Cmd.none
            )

        ( DecreaseSize, { boardDimensions }, _ ) ->
            ( { model
                | boardDimensions =
                    ( first boardDimensions - 1, second boardDimensions - 1 )
              }
            , Cmd.none
            )

        ( ZoomIn, { zoomLevel }, _ ) ->
            ( { model | zoomLevel = zoomLevel + 0.1 }, Cmd.none )

        ( ZoomOut, { zoomLevel }, _ ) ->
            ( { model | zoomLevel = zoomLevel - 0.1 }, Cmd.none )

        ( Reset, _, _ ) ->
            ( { model | program = [] }, Cmd.none )


subscriptions : Model -> Sub msg
subscriptions model =
    Sub.none


view : Model -> Html Msg
view model =
    let
        title =
            mainTitle "Brainloller"

        containerClasses =
            [ "main-container"
            , Tac.cf
            , Tac.pa3
            , Tac.pa4_ns
            ]
    in
    div [ classes containerClasses ]
        [ stylesheet "/build/tachyons.min.css"
        , stylesheet "/assets/styles/editor.css"
        , title
        , textCopy
            [ link "Brainloller" "https://esolangs.org/wiki/Brainloller" True
            , text " is "
            , link "Brainfuck" "http://minond.xyz/brainfuck" False
            , text """ but represented as an image. In Brainfuck you start
                with a tape of cells ranging from 0 to, in this case,
                """
            , link "infinity" "https://en.wikipedia.org/wiki/Infinity" True
            , text """ or as much as your browser can store. This is your
                program's memory. Memory is manipulated using commands that let
                increment and decrement the value of the current cell and that
                let you shift the active cell to the left or to the right. In
                addition to the cell manipulating commands you have a loop
                construct (a command for starting a loop and a separate one for
                ending it) and input and output commands.
                """
            ]
        , textCopy
            [ text "This gives you a total of 8 commands that leave you with a "
            , link "turing complete" "https://en.wikipedia.org/wiki/Turing_completeness" True
            , text """ language, what ever that actually means in practice, but
                in theory it means you can program anything. Given that
                Brainloller code is store in a two dimensional image, the
                language provides two additional commands for rotating the
                instruction pointer direction.
                """
            ]
        , programContainer model
        ]


programContainer : Model -> Html Msg
programContainer model =
    let
        growBtn =
            cmdBtn "assets/images/increase.svg" [ onClick IncreaseSize ]

        shrinkBtn =
            cmdBtn "assets/images/decrease.svg" [ onClick DecreaseSize ]

        zoomInBtn =
            cmdBtn "assets/images/zoom-in.svg" [ onClick ZoomIn ]

        zoomOutBtn =
            cmdBtn "assets/images/zoom-out.svg" [ onClick ZoomOut ]

        resetBtn =
            cmdBtn "assets/images/trash.svg" [ onClick Reset ]
    in
    div []
        [ div
            []
          <|
            growBtn
                :: shrinkBtn
                :: zoomInBtn
                :: zoomOutBtn
                :: resetBtn
                :: programCommands model
        , div
            []
            [ programOutput model ]
        ]


programOutput : Model -> Html Msg
programOutput model =
    let
        program =
            model.program

        dim =
            programDimensions program

        width =
            max (first dim) (first model.boardDimensions)

        height =
            max (second dim) (second model.boardDimensions)

        write =
            \x y f -> WriteCmd x y f
    in
    div
        [ class "program-cells" ]
        [ div
            [ style [ ( "zoom", toString model.zoomLevel ) ] ]
            [ programCells width height model.program write EnableWrite DisableWrite ]
        ]


programCommands : Model -> List (Html Msg)
programCommands model =
    let
        setCmd =
            \cmd -> SetCmd cmd

        activeCmd =
            Maybe.withDefault "" model.activeCmd
    in
    commandsForm setCmd activeCmd
