port module Main exposing (main)

import Brainloller.Lang exposing (BLOptCode, BLProgram, blCmdPixel, getBlCmd)
import Brainloller.Pixel exposing (commandsForm, getCellMaybe, programCells, programDimensions, resizeProgram, setCellAt)
import Brainloller.Program exposing (progHelloWorld)
import Elem exposing (cmdBtn, link, mainTitle, textCopy)
import Html exposing (Html, div, input, text)
import Html.Attributes exposing (class, id, style, type_)
import Html.Events exposing (on, onClick)
import Json.Decode as Json
import List
import Maybe
import Ports exposing (imageProcessed, uploadFile)
import Tachyons exposing (classes)
import Tachyons.Classes as Tac
import Tuple exposing (first, second)
import Util exposing (asList)


type Msg
    = NoOp
    | SetCmd BLOptCode
    | WriteCmd Int Int Bool
    | EnableWrite
    | DisableWrite
    | IncreaseSize
    | DecreaseSize
    | UploadFile
    | ImageProcessed BLProgram
    | Undo
    | Redo
    | ZoomIn
    | ZoomOut
    | Reset


type History a
    = Curr a
    | BackCurr (List a) a
    | BackCurrForw (List a) a (List a)


type alias Model =
    { work : History BLProgram
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
    { work = Curr progHelloWorld
    , activeCmd = Nothing
    , boardDimensions = programDimensions progHelloWorld
    , zoomLevel = 1
    , writeEnabled = False
    }


update : Msg -> Model -> ( Model, Cmd Msg )
update message model =
    case ( message, model, model.activeCmd ) of
        ( NoOp, _, _ ) ->
            ( model, Cmd.none )

        ( UploadFile, _, _ ) ->
            ( model, uploadFile "#fileupload" )

        ( ImageProcessed prog, _, _ ) ->
            ( { model
                | work = Curr prog
                , zoomLevel = 1
                , boardDimensions = programDimensions prog
              }
            , Cmd.none
            )

        ( Undo, { work }, _ ) ->
            case work of
                Curr _ ->
                    ( model, Cmd.none )

                BackCurr back curr ->
                    let
                        newCurr =
                            asList <| List.head back

                        newBack =
                            asList <| List.tail back

                        newForw =
                            [ curr ]

                        update =
                            BackCurrForw newBack newCurr newForw
                    in
                    ( { model | work = update }, Cmd.none )

                BackCurrForw back curr forw ->
                    let
                        newForw =
                            curr :: forw

                        update =
                            case back of
                                [] ->
                                    BackCurrForw [] curr forw

                                [ head ] ->
                                    BackCurrForw [] head newForw

                                head :: tail ->
                                    BackCurrForw tail head newForw
                    in
                    ( { model | work = update }, Cmd.none )

        ( Redo, { work }, _ ) ->
            case work of
                BackCurrForw back curr forw ->
                    let
                        newBack =
                            curr :: back

                        update =
                            case forw of
                                [] ->
                                    BackCurr back curr

                                [ head ] ->
                                    BackCurr newBack head

                                head :: tail ->
                                    BackCurrForw newBack head tail
                    in
                    ( { model | work = update }, Cmd.none )

                _ ->
                    ( model, Cmd.none )

        ( WriteCmd x y force, { writeEnabled, work }, Just activeCmd ) ->
            let
                program =
                    historyCurr work

                back =
                    program :: historyBack work

                pixel =
                    getBlCmd activeCmd blCmdPixel

                rewrite =
                    force || writeEnabled

                resized =
                    if rewrite then
                        resizeProgram program x y
                    else
                        program

                update =
                    case ( rewrite, getCellMaybe resized x y ) of
                        ( True, Just _ ) ->
                            BackCurr back (setCellAt resized x y pixel)

                        _ ->
                            work
            in
            ( { model | work = update }, Cmd.none )

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
            ( { model | work = Curr [] }, Cmd.none )


subscriptions : Model -> Sub Msg
subscriptions model =
    imageProcessed ImageProcessed


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
        [ title
        , textCopy introText
        , programContainer model
        ]


programContainer : Model -> Html Msg
programContainer model =
    let
        uploadBtn =
            cmdBtn "Upload" "assets/images/upload.png" [ onClick NoOp ]

        downloadBtn =
            cmdBtn "Download" "assets/images/download.png" [ onClick NoOp ]

        playBtn =
            cmdBtn "Play" "assets/images/play.png" [ onClick NoOp ]

        pauseBtn =
            cmdBtn "Pause" "assets/images/pause.png" [ onClick NoOp ]

        undoBtn =
            cmdBtn "Undo" "assets/images/undo.png" [ onClick Undo ]

        redoBtn =
            cmdBtn "Redo" "assets/images/redo.png" [ onClick Redo ]

        growBtn =
            cmdBtn "Expand canvas" "assets/images/expand.png" [ onClick IncreaseSize ]

        shrinkBtn =
            cmdBtn "Contract canvas" "assets/images/contract.png" [ onClick DecreaseSize ]

        zoomInBtn =
            cmdBtn "Zoom in" "assets/images/zoomin.png" [ onClick ZoomIn ]

        zoomOutBtn =
            cmdBtn "Zoom out" "assets/images/zoomout.png" [ onClick ZoomOut ]

        resetBtn =
            cmdBtn "Clear" "assets/images/blank.png" [ onClick Reset ]

        commands =
            [ playBtn
            , pauseBtn
            , undoBtn
            , redoBtn
            , growBtn
            , shrinkBtn
            , zoomInBtn
            , zoomOutBtn
            , resetBtn
            , uploadBtn
            , downloadBtn
            ]

        inputs =
            [ input
                [ type_ "file"
                , id "fileupload"
                , on "change" (Json.succeed UploadFile)
                ]
                []
            ]
    in
    div []
        [ div
            []
            (commands ++ programCommands model ++ inputs)
        , div
            []
            [ programOutput model ]
        ]


programOutput : Model -> Html Msg
programOutput model =
    let
        program =
            historyCurr model.work

        dim =
            programDimensions program

        width =
            2 + max (first dim) (first model.boardDimensions)

        height =
            2 + max (second dim) (second model.boardDimensions)

        write =
            \x y f -> WriteCmd x y f
    in
    div
        [ class "program-cells" ]
        [ div
            [ style [ ( "zoom", toString model.zoomLevel ) ] ]
            [ programCells width height program write EnableWrite DisableWrite ]
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


historyCurr : History a -> a
historyCurr hist =
    case hist of
        Curr val ->
            val

        BackCurr _ val ->
            val

        BackCurrForw _ val _ ->
            val


historyBack : History a -> List a
historyBack hist =
    case hist of
        Curr _ ->
            []

        BackCurr back _ ->
            back

        BackCurrForw back _ _ ->
            back


historyForw : History a -> List a
historyForw hist =
    case hist of
        Curr _ ->
            []

        BackCurr _ _ ->
            []

        BackCurrForw _ _ forw ->
            forw


introText : List (Html msg)
introText =
    [ textCopy
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
    ]
